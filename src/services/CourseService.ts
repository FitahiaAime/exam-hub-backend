import { CourseRepository } from '../repositories/CourseRepository';
import { CreateCourseDTO, UpdateCourseDTO } from '../models/Course';

export class CourseService {
    private courseRepository: CourseRepository;

    constructor() {
        this.courseRepository = new CourseRepository();
    }

    async getAllCourses() {
        return this.courseRepository.findAll();
    }

    async getCourseById(id: number) {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new Error('Cours introuvable');
        }
        return course;
    }

    async createCourse(data: CreateCourseDTO) {
        const existing = await this.courseRepository.findByCode(data.code);
        if (existing) {
            throw new Error('Ce code de cours existe déjà');
        }

        if (!data.code || !data.name) {
            throw new Error('Code et nom du cours sont obligatoires');
        }

        return this.courseRepository.create(data);
    }

    async updateCourse(id: number, data: UpdateCourseDTO) {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new Error('Cours introuvable');
        }

        if (data.code && data.code !== course.code) {
            const existing = await this.courseRepository.findByCode(data.code);
            if (existing) {
                throw new Error('Ce code de cours existe déjà');
            }
        }

        return this.courseRepository.update(id, data);
    }

    async deleteCourse(id: number) {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new Error('Cours introuvable');
        }

        const hasExams = await this.courseRepository.hasExams(id);
        if (hasExams) {
            throw new Error('Impossible de supprimer un cours qui possède des examens');
        }

        const deleted = await this.courseRepository.delete(id);
        if (!deleted) {
            throw new Error('Échec de la suppression du cours');
        }
    }
}
