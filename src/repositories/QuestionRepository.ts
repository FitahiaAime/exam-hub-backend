import { pool } from '../config/database';
import {Question, CreateQuestionDTO, UpdateQuestionDTO} from '../models/Question';

export class QuestionRepository {

    async findByExam(examId: number): Promise<Question[]> {
        const result = await pool.query<Question>(
            `SELECT *
             FROM questions
             WHERE exam_id = $1
             ORDER BY created_at`,
            [examId]
        );

        return result.rows;
    }

    async findById(id: number): Promise<Question | null> {
        const result = await pool.query<Question>(
            `SELECT *
             FROM questions
             WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    async findByIdWithExam(
        id: number
    ): Promise<Question | null> {
        const result = await pool.query<Question>(
            `SELECT q.*
             FROM questions q
             JOIN exams e ON q.exam_id = e.id
             WHERE q.id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    async create(data: CreateQuestionDTO): Promise<Question> {
        const { exam_id, statement, points } = data;

        const result = await pool.query<Question>(
            `INSERT INTO questions (exam_id, statement, points)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [exam_id, statement, points]
        );

        return result.rows[0];
    }

    async update(
        id: number,
        data: UpdateQuestionDTO
    ): Promise<Question | null> {

        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        if (data.statement !== undefined) {
            fields.push(`statement = $${paramIndex++}`);
            values.push(data.statement);
        }

        if (data.points !== undefined) {
            fields.push(`points = $${paramIndex++}`);
            values.push(data.points);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        const query = `
            UPDATE questions
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
                RETURNING *
        `;

        const result = await pool.query<Question>(
            query,
            values
        );

        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM questions
             WHERE id = $1`,
            [id]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    async isLocked(id: number): Promise<boolean> {
        const result = await pool.query<{ is_locked: boolean }>(
            `SELECT is_locked
             FROM questions
             WHERE id = $1`,
            [id]
        );

        return result.rows[0]?.is_locked ?? false;
    }
}
