import { Router } from 'express';
import { ExamController } from '../controllers/ExamController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const examController = new ExamController();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', (req, res) => examController.getAll(req, res));

router.get('/:id', (req, res) => examController.getById(req, res));

router.post('/', (req, res) => examController.create(req, res));

router.put('/:id', (req, res) => examController.update(req, res));

router.delete('/:id', (req, res) => examController.delete(req, res));

export default router;
