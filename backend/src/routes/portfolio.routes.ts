import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All portfolio routes require authentication
router.use(authenticate);

router.post('/positions', portfolioController.addPosition);
router.get('/positions', portfolioController.getPositions);
router.get('/positions/:id', portfolioController.getPositionById);
router.put('/positions/:id', portfolioController.updatePosition);
router.delete('/positions/:id', portfolioController.deletePosition);
router.get('/value', portfolioController.getPortfolioValue);
router.get('/prices', portfolioController.getPrices);
router.get('/search', portfolioController.searchStocks);
router.get('/history/:symbol', portfolioController.getStockHistory);

export default router;
