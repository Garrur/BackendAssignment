import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { recordsService } from './records.service';
import { createRecordSchema, updateRecordSchema, listRecordsSchema } from './records.schema';

const router = Router();

// All routes require auth
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (Analyst, Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: number, example: 5000.00 }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string, example: Salary }
 *               date: { type: string, format: date-time, example: "2024-03-01T00:00:00.000Z" }
 *               description: { type: string, example: Monthly salary }
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Viewers cannot create records
 */
router.post('/', authorize('ANALYST', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createRecordSchema.parse(req.body);
    const record = await recordsService.createRecord(input, req.user!.id);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List all financial records with filtering and pagination
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [INCOME, EXPENSE] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of records
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listRecordsSchema.parse(req.query);
    const result = await recordsService.listRecords(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record details
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsService.getRecordById(req.params.id as string);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a financial record (Analyst, Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string }
 *               date: { type: string, format: date-time }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Record updated
 */
router.patch('/:id', authorize('ANALYST', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateRecordSchema.parse(req.body);
    const record = await recordsService.updateRecord(req.params.id as string, input);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record deleted
 *       403:
 *         description: Only admins can delete records
 */
router.delete('/:id', authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await recordsService.softDeleteRecord(req.params.id as string);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
