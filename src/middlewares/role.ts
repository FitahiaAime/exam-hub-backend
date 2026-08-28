import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireRole(role: 'admin' | 'student') {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.role !== role) {
            return res.status(403).json({ message: 'Non autorisé' });
        }
        next();
    };
}
