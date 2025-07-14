import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';
import { tokenBlacklist } from './tokenBlacklist';

// Session type extension
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    email?: string;
    role?: string;
    token?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Input sanitization utility
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
    .substring(0, 255); // Limit length
}

// Validate IP address format
function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip) || ip === 'unknown';
}

// Rate limiting for authentication attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

// Security logging
function logSecurityEvent(event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(details, null, 2));
}

// JWT secret key - must be set in production
const JWT_SECRET = process.env.JWT_SECRET || "cryptonbets_jwt_secret_key_2024_secure_random_string_1234567890abcdef";

/**
 * Password hashing utility
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Password verification utility
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log(`Şifre doğrulama başladı - Düz şifre: ${plainPassword.substr(0, 3)}***`);
    console.log(`Hash değeri: ${hashedPassword}`);
    
    // Bcrypt.compare ile şifre doğrulama yapılıyor
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    
    console.log(`Bcrypt karşılaştırma sonucu: ${result}`);
    return result;
  } catch (error) {
    console.error('Şifre doğrulama sırasında hata:', error);
    return false;
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Guest-friendly chat middleware
 * Allows guest users to access chat without authentication
 */
export function guestChatMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // If no token, allow as guest user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined; // Mark as guest user
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = undefined; // Mark as guest user
    return next();
  }

  // Try to verify token for registered users
  console.log('guestChatMiddleware - Token received:', token.substring(0, 20));
  console.log('guestChatMiddleware - JWT_SECRET length:', JWT_SECRET.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('guestChatMiddleware - JWT decoded successfully:', decoded);
    if (decoded && decoded.id) {
      req.user = { id: decoded.id };
      console.log('guestChatMiddleware - User authenticated:', decoded.id);
    } else {
      req.user = undefined; // Mark as guest user
      console.log('guestChatMiddleware - No user ID in token');
    }
  } catch (error) {
    console.log('guestChatMiddleware - JWT decode failed:', (error as Error).message);
    req.user = undefined; // Mark as guest user
  }
  
  next();
}

/**
 * Authentication middleware
 * Secure authentication for all environments
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check session first (for admin panel)
  if (req.session && req.session.userId) {
    logSecurityEvent('AUTH_SUCCESS', { 
      userId: req.session.userId, 
      username: req.session.username || 'admin', 
      ip: clientIP, 
      path: req.path,
      method: 'SESSION'
    });
    
    req.user = {
      id: req.session.userId,
      username: req.session.username || 'admin',
      email: req.session.email || '',
      role: req.session.role || 'admin'
    };
    
    return next();
  }
  
  // Fall back to Bearer token authentication
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurityEvent('AUTH_MISSING_TOKEN', { 
      ip: clientIP, 
      path: req.path, 
      method: req.method 
    });
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    logSecurityEvent('AUTH_INVALID_FORMAT', { 
      ip: clientIP, 
      path: req.path 
    });
    return res.status(401).json({ error: 'Invalid token format' });
  }

  // Token blacklist kontrolü
  if (tokenBlacklist.isBlacklisted(token)) {
    logSecurityEvent('AUTH_TOKEN_BLACKLISTED', { 
      ip: clientIP, 
      path: req.path,
      tokenStart: token.substring(0, 20),
      severity: 'HIGH'
    });
    return res.status(401).json({ error: 'Token has been invalidated' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    logSecurityEvent('AUTH_TOKEN_INVALID', { 
      ip: clientIP, 
      path: req.path,
      severity: 'MEDIUM'
    });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Additional security validation
  if (!decoded.id || !decoded.username) {
    logSecurityEvent('AUTH_PAYLOAD_INVALID', { 
      ip: clientIP, 
      path: req.path,
      tokenPayload: Object.keys(decoded),
      severity: 'HIGH'
    });
    return res.status(401).json({ error: 'Invalid token payload' });
  }
  
  // Log successful authentication
  logSecurityEvent('AUTH_SUCCESS', { 
    userId: decoded.id, 
    username: decoded.username, 
    ip: clientIP, 
    path: req.path,
    method: 'TOKEN'
  });
  
  // Set session info for admin panel compatibility
  if (req.session) {
    req.session.userId = decoded.id;
    req.session.username = decoded.username;
    req.session.role = decoded.role || 'user';
    req.session.token = token;
  }
  
  req.user = decoded;
  next();
}

/**
 * User authentication middleware
 * Checks if the user is logged in
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check if user is already authenticated by previous middleware
  if (req.user) {
    return next();
  }
  
  // If not authenticated, check for token in headers or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
  
  req.user = decoded;
  next();
}

/**
 * Admin authorization middleware
 * Checks if the user has admin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if the user has admin role
  if ((req.user as any).role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin privileges required' });
}

/**
 * Combined middleware for admin authentication and authorization
 * First authenticates via token, then checks admin role
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // For development mode, automatically grant admin access
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 Development mode - automatic admin access granted (requireAdminAuth)');
    req.user = {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // Check session-based authentication first (for admin panel)
  if (req.session && (req.session as any).userId) {
    // Set user from session
    req.user = {
      id: (req.session as any).userId,
      username: (req.session as any).username || 'admin',
      email: (req.session as any).email || '',
      role: (req.session as any).role || 'admin'
    };
    
    // Check if user has admin role
    if ((req.user as any).role === 'admin') {
      logSecurityEvent('ADMIN_AUTH_SUCCESS', { 
        userId: (req.user as any).id, 
        username: (req.user as any).username,
        ip: clientIP, 
        path: req.path,
        method: 'SESSION'
      });
      return next();
    } else {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
  }

  // Check token-based authentication
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  req.user = decoded;
  logSecurityEvent('ADMIN_AUTH_SUCCESS', { 
    userId: decoded.id, 
    username: decoded.username,
    ip: clientIP, 
    path: req.path,
    method: 'TOKEN'
  });
  next();
}

/**
 * Rate limiting for login attempts
 */
export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
    logSecurityEvent('LOGIN_ATTEMPT', { identifier, attempt: 1, blocked: false });
    return { allowed: true };
  }

  // Check if block period has expired
  if (attempt.blocked && (now - attempt.lastAttempt) > BLOCK_DURATION) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
    logSecurityEvent('BLOCK_EXPIRED', { identifier, previousAttempts: attempt.count });
    return { allowed: true };
  }

  // If still blocked
  if (attempt.blocked) {
    const retryAfter = Math.ceil((BLOCK_DURATION - (now - attempt.lastAttempt)) / 1000);
    logSecurityEvent('LOGIN_BLOCKED', { identifier, attemptsCount: attempt.count, retryAfter });
    return { allowed: false, retryAfter };
  }

  // Check if attempt window has expired
  if ((now - attempt.lastAttempt) > ATTEMPT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
    logSecurityEvent('ATTEMPT_WINDOW_RESET', { identifier, previousAttempts: attempt.count });
    return { allowed: true };
  }

  // Increment attempts
  const newCount = attempt.count + 1;
  const blocked = newCount >= MAX_LOGIN_ATTEMPTS;
  
  loginAttempts.set(identifier, { 
    count: newCount, 
    lastAttempt: now, 
    blocked 
  });

  if (blocked) {
    logSecurityEvent('ACCOUNT_BLOCKED', { 
      identifier, 
      attemptsCount: newCount, 
      blockDuration: BLOCK_DURATION / 1000,
      severity: 'HIGH'
    });
    return { allowed: false, retryAfter: Math.ceil(BLOCK_DURATION / 1000) };
  }

  logSecurityEvent('LOGIN_ATTEMPT', { identifier, attempt: newCount, blocked: false });
  return { allowed: true };
}

/**
 * Reset login attempts for successful login
 */
export function resetLoginAttempts(identifier: string): void {
  const attempt = loginAttempts.get(identifier);
  if (attempt) {
    logSecurityEvent('LOGIN_SUCCESS', { 
      identifier, 
      previousAttempts: attempt.count,
      wasBlocked: attempt.blocked 
    });
  }
  loginAttempts.delete(identifier);
}

/**
 * Verify authentication token and return user data
 */
export async function verifyAuth(req: Request): Promise<any> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }
  
  return decoded;
}