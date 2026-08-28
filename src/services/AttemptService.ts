import { pool } from '../config/database';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { ChoiceRepository } from '../repositories/ChoiceRepository';
import { AnswerSubmission } from '../models/Attempt';
import { CreateAnswerDTO } from '../models/Answer';

export class AttemptService {
    private attemptRepository: AttemptRepository;
    private questionRepository: QuestionRepository;
    private choiceRepository: ChoiceRepository;

    constructor() {
        this.attemptRepository = new AttemptRepository();
        this.questionRepository = new QuestionRepository();
        this.choiceRepository = new ChoiceRepository();
    }

    async hasExistingAttempt(examId: number, studentId: number): Promise<boolean> {
        const attempt = await this.attemptRepository.findByExamAndStudent(examId, studentId);
        return attempt !== null;
    }

    async createAttempt(examId: number, studentId: number, score: number) {
        return this.attemptRepository.create({ exam_id: examId, student_id: studentId, score });
    }

    async calculateScore(examId: number, answers: Record<number, number | null>): Promise<number> {
        const questions = await this.questionRepository.findByExam(examId);
        let totalScore = 0;

        for (const question of questions) {
            const selectedChoiceId = answers[question.id];

            if (selectedChoiceId === null || selectedChoiceId === undefined) {
                continue;
            }

            const choice = await this.choiceRepository.findById(selectedChoiceId);
            if (choice?.is_correct) {
                totalScore += question.points;
            }
        }

        return totalScore;
    }

    async getTotalPoints(examId: number): Promise<number> {
        const questions = await this.questionRepository.findByExam(examId);
        return questions.reduce((sum, q) => sum + q.points, 0);
    }

    async saveAnswers(attemptId: number, answers: AnswerSubmission[]) {
        const answerDTOs: CreateAnswerDTO[] = answers.map(a => ({
            attempt_id: attemptId,
            question_id: a.question_id,
            choice_id: a.choice_id
        }));

        return this.attemptRepository.createAnswers(answerDTOs);
    }

    async getCorrection(attemptId: number) {
        return this.attemptRepository.getAnswersWithCorrection(attemptId);
    }

    async getStudentResults(studentId: number) {
        return this.attemptRepository.findByStudent(studentId);
    }
}
