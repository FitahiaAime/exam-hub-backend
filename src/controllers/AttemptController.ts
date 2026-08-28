import { Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';
import { ExamService } from '../services/ExamService';
import { AuthRequest } from '../middlewares/auth';

export class AttemptController {
    private attemptService: AttemptService;
    private examService: ExamService;

    constructor() {
        this.attemptService = new AttemptService();
        this.examService = new ExamService();
    }

    async submitExam(req: AuthRequest, res: Response) {
        try {
            const examId = parseInt(req.params.id);
            const studentId = req.userId!;
            const { answers }: { answers: Record<number, number | null> } = req.body;

            const existing = await this.attemptService.hasExistingAttempt(examId, studentId);
            if (existing) {
                return res.status(409).json({ message: 'Vous avez déjà passé cet examen' });
            }

            const isAvailable = await this.examService.checkAvailability(examId);
            if (!isAvailable) {
                return res.status(403).json({ message: 'Examen non disponible' });
            }

            const score = await this.attemptService.calculateScore(examId, answers);
            const totalPoints = await this.attemptService.getTotalPoints(examId);

            const attempt = await this.attemptService.createAttempt(examId, studentId, score);

            const answerSubmissions = Object.entries(answers).map(([questionId, choiceId]) => ({
                question_id: parseInt(questionId),
                choice_id: choiceId
            }));

            await this.attemptService.saveAnswers(attempt.id, answerSubmissions);

            const correction = await this.attemptService.getCorrection(attempt.id);

            res.json({
                score,
                total: totalPoints,
                correction
            });
        } catch (error: any) {
            if (error.message.includes('déjà passé')) {
                return res.status(409).json({ message: error.message });
            }
            if (error.message.includes('non disponible')) {
                return res.status(403).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async getMyResults(req: AuthRequest, res: Response) {
        try {
            const studentId = req.userId!;
            const results = await this.attemptService.getStudentResults(studentId);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
