import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { dashboardService } from './dashboard.service';

const router = Router();

// All dashboard routes require authentication; all roles can view
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get overall financial summary (total income, expenses, net balance)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary
 */
router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getSummary();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/dashboard/by-category:
 *   get:
 *     summary: Get totals grouped by category (income and expense)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise breakdown
 */
router.get('/by-category', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getByCategory();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/dashboard/by-month:
 *   get:
 *     summary: Get monthly income vs expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
router.get('/by-month', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getByMonth();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent financial activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Recent records
 */
router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const data = await dashboardService.getRecent(limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
