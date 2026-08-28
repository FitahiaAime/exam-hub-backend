import { Request, Response } from 'express';
import { ResultService } from '../services/ResultService';
import { AuthRequest } from '../middlewares/auth';

export class ResultController {
    private resultService: ResultService;

    constructor() {
        this.resultService = new ResultService();
    }

    async getExamResults(req: AuthRequest, res: Response) {
        try {
            const examId = parseInt(req.params.id);
            const results = await this.resultService.getExamResults(examId);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
