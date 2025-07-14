import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: {
    id: number;
    username: string;
    role: string;
  };
}

// Güvenli admin kimlik doğrulama middleware
export const requireAdminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Admin token gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Admin rolü kontrolü
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz admin token' });
  }
};

// VIP seviye değişikliği için ek güvenlik
export const validateVipChange = (req: AdminRequest, res: Response, next: NextFunction) => {
  const { userId, newLevel } = req.body;
  
  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
  }
  
  if (newLevel < 0 || newLevel > 5) {
    return res.status(400).json({ error: 'VIP seviyesi 0-5 arasında olmalı' });
  }
  
  next();
};

// Bonus verme için güvenlik kontrolü
export const validateBonusAmount = (req: AdminRequest, res: Response, next: NextFunction) => {
  const { amount, userId } = req.body;
  
  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
  }
  
  if (!amount || amount <= 0 || amount > 10000) {
    return res.status(400).json({ error: 'Bonus miktarı 1-10000 TL arasında olmalı' });
  }
  
  next();
};