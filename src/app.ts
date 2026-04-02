import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { errorHandler } from './middleware/errorHandler';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import recordsRouter from './modules/records/records.router';
import dashboardRouter from './modules/dashboard/dashboard.router';

const app = express();

// ── Security & parsing middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger / OpenAPI ──────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Data Processing API',
      version: '1.0.0',
      description:
        'A RESTful API for finance data processing and access control. Supports role-based authentication (Viewer / Analyst / Admin), financial record CRUD, and aggregated dashboard analytics.',
      contact: { name: 'Finance Backend API' },
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Register, login, and get current user' },
      { name: 'Users', description: 'User management — Admin only' },
      { name: 'Records', description: 'Financial record CRUD with filtering' },
      { name: 'Dashboard', description: 'Summary analytics and trends' },
    ],
  },
  apis: ['./src/modules/**/*.router.ts'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Finance API Docs',
  customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
}));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);

// ── Root Redirect ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler);

export default app;
