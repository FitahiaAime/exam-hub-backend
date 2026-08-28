import { pool } from '../config/database';
import { Course, CreateCourseDTO, UpdateCourseDTO } from '../models/Course';

export class CourseRepository {
    async findAll(): Promise<Course[]> {
        const result = await pool.query<Course>('SELECT * FROM courses ORDER BY code');
        return result.rows;
    }

    async findById(id: number): Promise<Course | null> {
        const result = await pool.query<Course>('SELECT * FROM courses WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findByCode(code: string): Promise<Course | null> {
        const result = await pool.query<Course>('SELECT * FROM courses WHERE code = $1', [code]);
        return result.rows[0] || null;
    }

    async create(data: CreateCourseDTO): Promise<Course> {
        const { code, name, description } = data;
        const result = await pool.query<Course>(
            'INSERT INTO courses (code, name, description) VALUES ($1, $2, $3) RETURNING *',
            [code, name, description || null]
        );
        return result.rows[0];
    }

    async update(id: number, data: UpdateCourseDTO): Promise<Course | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.code !== undefined) {
            fields.push(`code = $${paramIndex++}`);
            values.push(data.code);
        }
        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await pool.query<Course>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async hasExams(courseId: number): Promise<boolean> {
        const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM exams WHERE course_id = $1) as exists',
            [courseId]
        );
        return result.rows[0].exists;
    }
}
