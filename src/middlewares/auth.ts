import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: number;
    role?: 'admin' | 'student';
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non authentifié' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            role: 'admin' | 'student'
        };

        req.userId = payload.userId;
        req.role = payload.role;
        next();
    } catch {
        return res.status(401).json({ message: 'Token invalide' });
    }
}
