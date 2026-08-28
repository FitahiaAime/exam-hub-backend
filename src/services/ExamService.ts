import { pool } from '../config/database';
import { ExamRepository } from '../repositories/ExamRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { CreateExamDTO, UpdateExamDTO } from '../models/Exam';

export class ExamService {
    private examRepository: ExamRepository;
    private courseRepository: CourseRepository;

    constructor() {
        this.examRepository = new ExamRepository();
        this.courseRepository = new CourseRepository();
    }

    async getAllExams() {
        return this.examRepository.findAll();
    }

    async getExamById(id: number) {
        const exam = await this.examRepository.findById(id);
        if (!exam) {
            throw new Error('Examen introuvable');
        }
        return exam;
    }

    async getExamWithAvailability(id: number) {
        const exam = await this.examRepository.getExamWithWindowCheck(id);
        if (!exam) {
            throw new Error('Examen introuvable');
        }
        return exam;
    }

    async createExam(data: CreateExamDTO) {
        const start = new Date(data.start_at);
        const end = new Date(data.end_at);

        if (end <= start) {
            throw new Error('La date de fin doit être postérieure à la date de début');
        }

        const course = await this.courseRepository.findById(data.course_id);
        if (!course) {
            throw new Error('Cours introuvable');
        }

        return this.examRepository.create(data);
    }

    async updateExam(id: number, data: UpdateExamDTO) {
        const exam = await this.examRepository.findById(id);
        if (!exam) {
            throw new Error('Examen introuvable');
        }

        const hasAttempts = await this.examRepository.hasAttempts(id);
        if (hasAttempts) {
            throw new Error('Impossible de modifier un examen ayant des tentatives (RG-08)');
        }

        if (data.start_at || data.end_at) {
            const start = new Date(data.start_at || exam.start_at);
            const end = new Date(data.end_at || exam.end_at);

            if (end <= start) {
                throw new Error('La date de fin doit être postérieure à la date de début');
            }
        }

        if (data.course_id) {
            const course = await this.courseRepository.findById(data.course_id);
            if (!course) {
                throw new Error('Cours introuvable');
            }
        }

        return this.examRepository.update(id, data);
    }

    async deleteExam(id: number) {
        const exam = await this.examRepository.findById(id);
        if (!exam) {
            throw new Error('Examen introuvable');
        }

        const hasAttempts = await this.examRepository.hasAttempts(id);
        if (hasAttempts) {
            throw new Error('Impossible de supprimer un examen ayant des tentatives (RG-09)');
        }

        const deleted = await this.examRepository.delete(id);
        if (!deleted) {
            throw new Error('Échec de la suppression de l\'examen');
        }
    }

    async checkAvailability(examId: number): Promise<boolean> {
        return this.examRepository.isWithinWindow(examId);
    }

    async getAvailableExamsForStudent(studentId: number) {
        const result = await pool.query(
            `SELECT e.* FROM exams e
       WHERE e.start_at <= NOW() 
         AND e.end_at >= NOW()
         AND NOT EXISTS (
           SELECT 1 FROM attempts a 
           WHERE a.exam_id = e.id AND a.student_id = $1
         )
       ORDER BY e.start_at DESC`,
            [studentId]
        );
        return result.rows;
    }
}
