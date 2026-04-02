import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { usersService } from './users.service';
import { updateUserSchema, listUsersSchema } from './users.schema';

const router = Router();

// All user management routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
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
 *         name: role
 *         schema: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Forbidden
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listUsersSchema.parse(req.query);
    const result = await usersService.listUsers(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id as string);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user's role or status (Admin only)
 *     tags: [Users]
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
 *               name: { type: string }
 *               role: { type: string, enum: [VIEWER, ANALYST, ADMIN] }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id as string, input);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.deactivateUser(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: user, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;
