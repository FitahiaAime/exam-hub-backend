import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const courseController = new CourseController();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', (req, res) => courseController.getAll(req, res));

router.get('/:id', (req, res) => courseController.getById(req, res));

router.post('/', (req, res) => courseController.create(req, res));

router.put('/:id', (req, res) => courseController.update(req, res));

router.delete('/:id', (req, res) => courseController.delete(req, res));


export default router;
