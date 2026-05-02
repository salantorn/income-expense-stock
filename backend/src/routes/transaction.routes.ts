import { Router } from 'express';
import * as txController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.post('/', txController.create);
router.get('/', txController.getAll);
router.get('/balance', txController.getBalance);
router.get('/by-category', txController.getByCategory);
router.get('/monthly-summary', txController.getMonthlySummary);
router.get('/:id', txController.getById);
router.put('/:id', txController.update);
router.delete('/:id', txController.remove);

export default router;
