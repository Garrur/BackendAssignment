# Finance Data Processing and Access Control Backend

A clean, production-quality REST API for a finance dashboard system, featuring **role-based access control**, financial record management, and aggregated analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (Node.js) |
| Framework | Express.js |
| Database | PostgreSQL (**NeonDB** — serverless) |
| ORM | **Prisma** |
| Auth | JWT (`jsonwebtoken`) |
| Validation | `zod` |
| Password Hashing | `bcryptjs` |
| API Docs | **Swagger UI** at `/api/docs` |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd finance-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your **NeonDB** connection string and JWT secret:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="change-this-to-a-strong-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

> Get your NeonDB URL from [neon.tech](https://neon.tech) → New Project → Connection String

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
npm run seed
```

This creates 3 demo users and 60 realistic financial records:

| Role | Email | Password |
|---|---|---|
| Admin | admin@finance.dev | Password123! |
| Analyst | analyst@finance.dev | Password123! |
| Viewer | viewer@finance.dev | Password123! |

### 5. Start the development server

```bash
npm run dev
```

Open **Swagger UI** at: `http://localhost:3000/api/docs`

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

Get a token by logging in via `POST /api/auth/login`.

---

### Auth Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and get JWT |
| GET | `/auth/me` | All roles | Get current user profile |

**Register example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Password123!","role":"ANALYST"}'
```

**Login example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.dev","password":"Password123!"}'
```

---

### User Endpoints (Admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users (paginated, filterable) |
| GET | `/users/:id` | Get a specific user |
| PATCH | `/users/:id` | Update role or status |
| DELETE | `/users/:id` | Deactivate a user |

**Query params for listing:** `page`, `limit`, `role`, `status`

---

### Financial Record Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/records` | Analyst, Admin | Create a record |
| GET | `/records` | All roles | List records (paginated + filtered) |
| GET | `/records/:id` | All roles | Get a specific record |
| PATCH | `/records/:id` | Analyst, Admin | Update a record |
| DELETE | `/records/:id` | Admin only | Soft delete a record |

**Query params for listing:**
- `page` (default: 1), `limit` (default: 20, max: 100)
- `type` — `INCOME` or `EXPENSE`
- `category` — partial match, case-insensitive
- `from` / `to` — ISO datetime range filter
- `search` — searches description and category

**Create record example:**
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"INCOME","category":"Salary","date":"2024-03-01T00:00:00.000Z","description":"Monthly salary"}'
```

---

### Dashboard Endpoints (All roles)

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard/summary` | Total income, expenses, net balance |
| GET | `/dashboard/by-category` | Totals grouped by category |
| GET | `/dashboard/by-month` | Monthly income vs expense trend |
| GET | `/dashboard/recent?limit=10` | Last N records (max 50) |

---

## Access Control Matrix

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Create record | ❌ | ✅ | ✅ |
| Update record | ❌ | ✅ | ✅ |
| Soft delete record | ❌ | ❌ | ✅ |
| List / manage users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |

---

## Project Structure

```
finance-backend/
├── prisma/
│   ├── schema.prisma       # Single source of truth for DB schema
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── config/env.ts       # Zod-validated env vars
│   ├── lib/prisma.ts       # Prisma client singleton
│   ├── middleware/
│   │   ├── authenticate.ts # JWT → req.user
│   │   ├── authorize.ts    # Role guard factory
│   │   └── errorHandler.ts # Centralized error handler
│   ├── modules/
│   │   ├── auth/           # Register, login, me
│   │   ├── users/          # Admin user management
│   │   ├── records/        # Financial records CRUD
│   │   └── dashboard/      # Aggregation APIs
│   ├── types/express.d.ts  # req.user type augmentation
│   ├── utils/AppError.ts   # Custom error class
│   ├── app.ts              # Express setup + Swagger
│   └── server.ts           # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design Decisions & Assumptions

1. **Soft delete** — Records are never permanently deleted; `isDeleted: true` hides them from all queries. Only admins can trigger this.
2. **Role assignment on register** — For simplicity during evaluation, the `role` field is accepted on registration. In a real system, only admins would be able to promote users.
3. **NeonDB** — Serverless PostgreSQL with connection pooling. The `?sslmode=require` parameter is mandatory.
4. **Dashboard aggregation** — The `by-month` endpoint uses a raw SQL query (`prisma.$queryRaw`) to extract year/month from the `date` column, which is more efficient than fetching all records and grouping in JavaScript.
5. **Passwords** — Never returned in any API response. All user selects explicitly exclude `passwordHash`.
6. **Consistent response shape** — All responses follow `{ success: boolean, data?: any, error?: { code, message } }`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm run seed` | Seed the database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
