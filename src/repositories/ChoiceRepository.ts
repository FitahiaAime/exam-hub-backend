import { pool } from '../config/database';
import { Choice, CreateChoiceDTO } from '../models/Choice';

export class ChoiceRepository {
    async findByQuestion(questionId: number): Promise<Choice[]> {
        const result = await pool.query<Choice>(
            'SELECT * FROM choices WHERE question_id = $1 ORDER BY created_at',
            [questionId]
        );
        return result.rows;
    }

    async findById(id: number): Promise<Choice | null> {
        const result = await pool.query<Choice>('SELECT * FROM choices WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByIdWithQuestion(id: number): Promise<(Choice & { question_id: number; is_locked: boolean }) | null> {
        const result = await pool.query(
            `SELECT c.*, q.question_id, q.is_locked 
       FROM choices c 
       JOIN questions q ON c.question_id = q.id 
       WHERE c.id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async createMany(questionId: number, choices: CreateChoiceDTO[]): Promise<Choice[]> {
        const values = choices.map((c, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(', ');
        const params: any[] = [questionId];

        choices.forEach(c => {
            params.push(c.label, c.is_correct);
        });

        const result = await pool.query<Choice>(
            `INSERT INTO choices (question_id, label, is_correct) VALUES ${values} RETURNING *`,
            params
        );
        return result.rows;
    }

    async deleteByQuestion(questionId: number): Promise<void> {
        await pool.query('DELETE FROM choices WHERE question_id = $1', [questionId]);
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM choices WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async countByQuestion(questionId: number): Promise<number> {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM choices WHERE question_id = $1',
            [questionId]
        );
        return parseInt(result.rows[0].count);
    }
}
