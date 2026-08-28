import { Router } from 'express';
import { ResultController } from '../controllers/ResultController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const resultController = new ResultController();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/exams/:id/results', (req, res) => resultController.getExamResults(req, res));

export default router;
