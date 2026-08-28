import { Router } from 'express';
import { AttemptController } from '../controllers/AttemptController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const attemptController = new AttemptController();

router.use(authenticate);
router.use(requireRole('student'));

router.post('/my/exams/:id/submit', (req, res) => attemptController.submitExam(req, res));

router.get('/my/results', (req, res) => attemptController.getMyResults(req, res));

export default router;
