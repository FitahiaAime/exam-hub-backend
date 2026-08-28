import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const result = await this.authService.login(email, password);

        if ('error' in result) {
            return res.status(result.status).json({ message: result.error });
        }

        return res.status(200).json(result);
    }
}
