import { pool } from '../config/database';
import { Exam, CreateExamDTO, UpdateExamDTO, ExamWithAvailability } from '../models/Exam';

export class ExamRepository {
    async findAll(): Promise<Exam[]> {
        const result = await pool.query<Exam>('SELECT * FROM exams ORDER BY created_at DESC');
        return result.rows;
    }

    async findById(id: number): Promise<Exam | null> {
        const result = await pool.query<Exam>('SELECT * FROM exams WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByCourse(courseId: number): Promise<Exam[]> {
        const result = await pool.query<Exam>(
            'SELECT * FROM exams WHERE course_id = $1 ORDER BY start_at DESC',
            [courseId]
        );
        return result.rows;
    }

    async create(data: CreateExamDTO): Promise<Exam> {
        const { course_id, title, description, start_at, end_at } = data;
        const result = await pool.query<Exam>(
            `INSERT INTO exams (course_id, title, description, start_at, end_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [course_id, title, description || null, start_at, end_at]
        );
        return result.rows[0];
    }

    async update(id: number, data: UpdateExamDTO): Promise<Exam | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.course_id !== undefined) {
            fields.push(`course_id = $${paramIndex++}`);
            values.push(data.course_id);
        }
        if (data.title !== undefined) {
            fields.push(`title = $${paramIndex++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (data.start_at !== undefined) {
            fields.push(`start_at = $${paramIndex++}`);
            values.push(data.start_at);
        }
        if (data.end_at !== undefined) {
            fields.push(`end_at = $${paramIndex++}`);
            values.push(data.end_at);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE exams SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query<Exam>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM exams WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async hasAttempts(examId: number): Promise<boolean> {
        const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM attempts WHERE exam_id = $1) as exists',
            [examId]
        );
        return result.rows[0].exists;
    }

    async isWithinWindow(examId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT EXISTS(
        SELECT 1 FROM exams 
        WHERE id = $1 AND start_at <= NOW() AND end_at >= NOW()
      ) as exists`,
            [examId]
        );
        return result.rows[0].exists;
    }

    async getExamWithWindowCheck(examId: number): Promise<ExamWithAvailability | null> {
        const result = await pool.query(
            `SELECT e.*, 
        (e.start_at <= NOW() AND e.end_at >= NOW()) as is_available
       FROM exams e 
       WHERE e.id = $1`,
            [examId]
        );
        return result.rows[0] || null;
    }
}
