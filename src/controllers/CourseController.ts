import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import { AuthRequest } from '../middlewares/auth';
import { CreateCourseDTO, UpdateCourseDTO } from '../models/Course';

export class CourseController {
    private courseService: CourseService;

    constructor() {
        this.courseService = new CourseService();
    }

    async getAll(req: AuthRequest, res: Response) {
        try {
            const courses = await this.courseService.getAllCourses();
            res.json(courses);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const course = await this.courseService.getCourseById(id);
            res.json(course);
        } catch (error: any) {
            if (error.message === 'Cours introuvable') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const { code, name, description }: CreateCourseDTO = req.body;

            if (!code || !name) {
                return res.status(400).json({ message: 'Code et nom du cours sont obligatoires' });
            }

            const course = await this.courseService.createCourse({ code, name, description });
            res.status(201).json(course);
        } catch (error: any) {
            if (error.message.includes('existe déjà')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data: UpdateCourseDTO = req.body;

            const course = await this.courseService.updateCourse(id, data);
            res.json(course);
        } catch (error: any) {
            if (error.message === 'Cours introuvable') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('existe déjà')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await this.courseService.deleteCourse(id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Cours introuvable') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('possède des examens')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }
}
