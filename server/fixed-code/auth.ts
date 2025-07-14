import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'cryptonbets-secret-key';

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
  return bcrypt.compare(plainPassword, hashedPassword);
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
 * Authentication middleware
 * For development mode, this automatically grants admin access
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // For development mode, automatically grant admin access
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode - automatic admin access granted (authMiddleware)');
    req.user = {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // For production, verify the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = decoded;
  next();
}

/**
 * User authentication middleware
 * Checks if the user is logged in
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For development mode, automatically authenticate
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode - automatic authentication granted (isAuthenticated)');
    req.user = {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // For production, use standard authentication flow
  if (req.user) {
    return next();
  }
  
  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Admin authorization middleware
 * Checks if the user has admin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // For development mode, automatically grant admin privileges
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode - automatic admin privileges granted (isAdmin)');
    req.user = {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // For production, check if the user has admin role
  if (req.user && (req.user as any).role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin privileges required' });
}