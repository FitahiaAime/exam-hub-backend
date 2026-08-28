import { AttemptRepository } from '../repositories/AttemptRepository';
import { pool } from '../config/database';

export class ResultService {
    private attemptRepository: AttemptRepository;

    constructor() {
        this.attemptRepository = new AttemptRepository();
    }

    async getExamResults(examId: number) {
        const result = await pool.query(
            `SELECT a.id as attempt_id, a.score, a.submitted_at,
              u.id as student_id, u.full_name as student_name, u.email as student_email
       FROM attempts a
       JOIN users u ON a.student_id = u.id
       WHERE a.exam_id = $1
       ORDER BY a.submitted_at DESC`,
            [examId]
        );

        const attempts = result.rows;

        const totalScore = attempts.reduce((sum, a: any) => sum + parseFloat(a.score), 0);
        const average = attempts.length > 0 ? totalScore / attempts.length : 0;

        return {
            exam_id: examId,
            attempts,
            statistics: {
                total_attempts: attempts.length,
                average_score: parseFloat(average.toFixed(2))
            }
        };
    }
}
