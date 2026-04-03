import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';

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

// ── Rate Limiting ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

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
