import { Request, Response } from 'express';
import { ExamService } from '../services/ExamService';
import { AuthRequest } from '../middlewares/auth';
import { CreateExamDTO, UpdateExamDTO } from '../models/Exam';

export class ExamController {
    private examService: ExamService;

    constructor() {
        this.examService = new ExamService();
    }

    async getAll(req: AuthRequest, res: Response) {
        try {
            const exams = await this.examService.getAllExams();
            res.json(exams);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const exam = await this.examService.getExamById(id);
            res.json(exam);
        } catch (error: any) {
            if (error.message === 'Examen introuvable') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const { course_id, title, description, start_at, end_at }: CreateExamDTO = req.body;

            if (!course_id || !title || !start_at || !end_at) {
                return res.status(400).json({
                    message: 'course_id, title, start_at et end_at sont obligatoires'
                });
            }

            const exam = await this.examService.createExam({
                course_id,
                title,
                description,
                start_at,
                end_at
            });
            res.status(201).json(exam);
        } catch (error: any) {
            if (error.message.includes('introuvable')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('date de fin')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data: UpdateExamDTO = req.body;

            const exam = await this.examService.updateExam(id, data);
            res.json(exam);
        } catch (error: any) {
            if (error.message === 'Examen introuvable') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('tentatives') || error.message.includes('RG-08')) {
                return res.status(409).json({ message: error.message });
            }
            if (error.message.includes('date de fin') || error.message.includes('introuvable')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await this.examService.deleteExam(id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Examen introuvable') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('tentatives') || error.message.includes('RG-09')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async getAvailableExams(req: AuthRequest, res: Response) {
        try {
            const studentId = req.userId!;
            const exams = await this.examService.getAvailableExamsForStudent(studentId);
            res.json(exams);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAvailableExam(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const studentId = req.userId!;

            const isAvailable = await this.examService.checkAvailability(id);
            if (!isAvailable) {
                return res.status(403).json({ message: 'Examen non disponible' });
            }

            const exam = await this.examService.getExamById(id);
            res.json(exam);
        } catch (error: any) {
            if (error.message === 'Examen introuvable') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }
}
