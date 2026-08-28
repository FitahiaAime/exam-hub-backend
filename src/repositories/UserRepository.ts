import { pool } from '../config/database';

export interface User {
    id: number;
    full_name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'student';
    is_active: boolean;
    created_at: Date;
}

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query<User>(
            `
          SELECT
            id,
            full_name,
            email,
            password_hash,
            role,
            is_active,
            created_at
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
        `,
            [email.trim()]
        );
        return result.rows[0] ?? null;
    }
}
