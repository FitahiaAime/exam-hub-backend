import { pool } from '../config/database';
import { Attempt, CreateAttemptDTO } from '../models/Attempt';
import { Answer, CreateAnswerDTO } from '../models/Answer';

export class AttemptRepository {
    async create(data: CreateAttemptDTO): Promise<Attempt> {
        const { exam_id, student_id, score } = data;
        const result = await pool.query<Attempt>(
            'INSERT INTO attempts (exam_id, student_id, score) VALUES ($1, $2, $3) RETURNING *',
            [exam_id, student_id, score]
        );
        return result.rows[0];
    }

    async findByExamAndStudent(examId: number, studentId: number): Promise<Attempt | null> {
        const result = await pool.query<Attempt>(
            'SELECT * FROM attempts WHERE exam_id = $1 AND student_id = $2',
            [examId, studentId]
        );
        return result.rows[0] || null;
    }

    async findByStudent(studentId: number): Promise<Attempt[]> {
        const result = await pool.query<Attempt>(
            `SELECT a.*, e.title as exam_title, e.course_id 
       FROM attempts a 
       JOIN exams e ON a.exam_id = e.id 
       WHERE a.student_id = $1 
       ORDER BY a.submitted_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    async createAnswers(answers: CreateAnswerDTO[]): Promise<Answer[]> {
        if (answers.length === 0) return [];

        const values = answers.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
        const params: any[] = [];

        answers.forEach(a => {
            params.push(a.attempt_id, a.question_id, a.choice_id);
        });

        const result = await pool.query<Answer>(
            `INSERT INTO answers (attempt_id, question_id, choice_id) VALUES ${values} RETURNING *`,
            params
        );
        return result.rows;
    }

    async getAnswersWithCorrection(attemptId: number): Promise<any[]> {
        const result = await pool.query(
            `SELECT a.question_id, a.choice_id as student_choice_id, c.is_correct,
              c.label as student_choice_label,
              correct_c.label as correct_choice_label, correct_c.id as correct_choice_id
       FROM answers a
       LEFT JOIN choices c ON a.choice_id = c.id
       LEFT JOIN choices correct_c ON correct_c.question_id = a.question_id AND correct_c.is_correct = TRUE
       WHERE a.attempt_id = $1`,
            [attemptId]
        );
        return result.rows;
    }
}
