import { pool } from '../config/database';
import { Answer } from '../models/Answer';

export class AnswerRepository {
    async findByAttempt(attemptId: number): Promise<Answer[]> {
        const result = await pool.query<Answer>(
            'SELECT * FROM answers WHERE attempt_id = $1',
            [attemptId]
        );
        return result.rows;
    }
}
