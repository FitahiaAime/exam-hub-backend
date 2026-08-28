import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, verifyPassword } from '../security/password';
import jwt from 'jsonwebtoken';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return { error: 'Email ou mot de passe incorrect', status: 401 };
        }

        if (!user.is_active) {
            return { error: 'Compte désactivé', status: 403 };  // RG-11
        }

        const valid = await verifyPassword(password, user.password_hash);

        if (!valid) {
            return { error: 'Email ou mot de passe incorrect', status: 401 };
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        return {
            token,
            user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
        };
    }
}