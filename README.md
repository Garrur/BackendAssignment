# Finance Data Processing and Access Control System

A complete production-quality stack featuring a robust **REST API Backend** and a beautifully designed **React Frontend Dashboard**. This system demonstrates role-based access control, financial record management, aggregated analytics, and clean architectural design.

---

## Technical Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Vanilla CSS (Glassmorphism design) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (**NeonDB** — serverless) |
| **ORM** | **Prisma** |
| **Auth** | JWT (`jsonwebtoken`) |
| **Validation** | `zod` |
| **API Docs** | **Swagger UI** |

---

## 🚀 Setup Process

### 1. Backend Setup

```bash
# Enter the backend directory and install dependencies
cd backend
npm install

# Configure environment variables (A test NeonDB URL is already pre-filled for your convenience)
cp .env.example .env
```

```bash
# Run migrations and seed database (Creates 3 test users and 60 records)
npm run db:migrate
npm run seed
```

**Seeded Demo Accounts:**
| Role | Email | Password |
|---|---|---|
| Admin | `admin@finance.dev` | `Password123!` |
| Analyst | `analyst@finance.dev` | `Password123!` |
| Viewer | `viewer@finance.dev` | `Password123!` |

```bash
# Start the backend server
npm run dev
```

### 2. Frontend Setup (Dashboard)

In a new terminal window:
```bash
cd frontend
npm install

# Start the Vite React development server
npm run dev
```
Open **http://localhost:5173** to view the live Dashboard.

---

## 🔒 Role-Based API Explanation

The system strictly enforces access through three distinct roles. Below is exactly how each role interacts with the API suite.

### 1. Viewer Role (`viewer@finance.dev` | `Password123!`)
*The Viewer is restricted to read-only access for analytical purposes.*
- **Auth APIs (`/api/auth/*`)**: Can register, login, and view their own profile.
- **Record APIs (`/api/records`)**: Can execute `GET /api/records` to list and filter records, and `GET /api/records/:id` to view specifics.
  - *Restriction:* Any attempt to `POST`, `PATCH`, or `DELETE` a record will return a `403 Forbidden`. The frontend explicitly removes the "Add Record", "Edit", and "Delete" buttons for Viewers.
- **Dashboard APIs (`/api/dashboard/*`)**: Full read access to summary aggregates, category splits, and monthly trends.
- **User APIs (`/api/users`)**: *Strictly Forbidden.* Attempting to view the user list returns a `403 Forbidden`.

**Testing in Postman / curl:**
```bash
# Step 1 — Get Viewer token
curl -s -X POST https://backendzoroyn.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@finance.dev","password":"Password123!"}'
# → Copy token from response

# Step 2 — View dashboard summary (✅ allowed)
curl https://backendzoroyn.onrender.com/api/dashboard/summary \
  -H "Authorization: Bearer <token>"

# Step 3 — List records (✅ allowed)
curl https://backendzoroyn.onrender.com/api/records \
  -H "Authorization: Bearer <token>"

# Step 4 — Try to create a record (❌ expect 403 Forbidden)
curl -X POST https://backendzoroyn.onrender.com/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"type":"INCOME","category":"Test","date":"2024-01-01T00:00:00.000Z"}'

# Step 5 — Try to access users (❌ expect 403 Forbidden)
curl https://backendzoroyn.onrender.com/api/users \
  -H "Authorization: Bearer <token>"
```

### 2. Analyst Role (`analyst@finance.dev` | `Password123!`)
*The Analyst manages the ledger but has no administrative power.*
- **Record Setup**: Inherits all Viewer permissions.
- **Data Entry**: Can execute `POST /api/records` to create new financial entries, and `PATCH /api/records/:id` to fix typos or adjust amounts safely.
  - *Restriction:* Analysts cannot `DELETE` records. The frontend hides the "Delete" button, and the API blocks the request.
- **User APIs**: *Strictly Forbidden.*

**Testing in Postman / curl:**
```bash
# Step 1 — Get Analyst token
curl -s -X POST https://backendzoroyn.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@finance.dev","password":"Password123!"}'
# → Copy token from response

# Step 2 — Create a new record (✅ allowed)
curl -X POST https://backendzoroyn.onrender.com/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":2500,"type":"INCOME","category":"Freelance","date":"2024-06-01T00:00:00.000Z","description":"Analyst test entry"}'
# → Copy the record id from response

# Step 3 — Update that record (✅ allowed)
curl -X PATCH https://backendzoroyn.onrender.com/api/records/<record-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":3000,"description":"Updated by analyst"}'

# Step 4 — Try to delete that record (❌ expect 403 Forbidden)
curl -X DELETE https://backendzoroyn.onrender.com/api/records/<record-id> \
  -H "Authorization: Bearer <token>"

# Step 5 — Try to access users (❌ expect 403 Forbidden)
curl https://backendzoroyn.onrender.com/api/users \
  -H "Authorization: Bearer <token>"
```

### 3. Admin Role (`admin@finance.dev` | `Password123!`)
*The Admin has absolute control over the system, data retention, and user management.*
- **Full Ledger Control**: Inherits all Analyst permissions. Can also execute `DELETE /api/records/:id` to soft-delete incorrect entries entirely from view.
- **User Management (`/api/users/*`)**: 
  - Can `GET` the paginated list of all registered users on the dedicated Frontend Users tab.
  - Can implement role promotions via `PATCH /api/users/:id` (e.g., upgrading a Viewer to an Analyst).
  - Can indefinitely suspend accounts via `DELETE /api/users/:id`.

**Testing in Postman / curl:**
```bash
# Step 1 — Get Admin token
curl -s -X POST https://backendzoroyn.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.dev","password":"Password123!"}'
# → Copy token from response

# Step 2 — Create a record (✅ allowed)
curl -X POST https://backendzoroyn.onrender.com/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":9999,"type":"INCOME","category":"Admin Test","date":"2024-06-01T00:00:00.000Z","description":"Admin created entry"}'
# → Copy the record id from response

# Step 3 — Soft-delete that record (✅ Admin only)
curl -X DELETE https://backendzoroyn.onrender.com/api/records/<record-id> \
  -H "Authorization: Bearer <token>"

# Step 4 — List all users (✅ Admin only)
curl https://backendzoroyn.onrender.com/api/users \
  -H "Authorization: Bearer <token>"
# → Copy a user id (e.g. the Viewer)

# Step 5 — Promote Viewer → Analyst (✅ Admin only)
curl -X PATCH https://backendzoroyn.onrender.com/api/users/<user-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"ANALYST"}'

# Step 6 — Deactivate a user (✅ Admin only)
curl -X DELETE https://backendzoroyn.onrender.com/api/users/<user-id> \
  -H "Authorization: Bearer <token>"

# Step 7 — View full dashboard analytics (✅ allowed)
curl https://backendzoroyn.onrender.com/api/dashboard/by-category \
  -H "Authorization: Bearer <token>"

curl https://backendzoroyn.onrender.com/api/dashboard/by-month \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Access Control Matrix

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

## 🏗️ Project Structure

```text
finance-dashboard-monorepo/
├── backend/                # Express & Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma   # Single source of truth for DB schema
│   │   └── seed.ts         # Demo data seeder
│   ├── src/
│   │   ├── config/         # Zod-validated env vars
│   │   ├── lib/            # Prisma client singleton
│   │   ├── middleware/     # JWT Auth, Role Guards, Error Handlers
│   │   ├── modules/        # Auth, Users, Records, Dashboard routers and services
│   │   ├── types/          # Express Request augmentation
│   │   ├── utils/          # AppError class
│   │   ├── app.ts          # Express setup + Swagger
│   │   └── server.ts       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/               # Full React TS Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts          # Axios Interceptors
│   │   └── App.tsx         # Reach Router + Role Guards
│   ├── package.json
│   └── tsconfig.json
└── README.md
```
---

## 📋 Assignment Requirements Fulfillment

Here is how the project maps directly to the specific goals laid out in the assignment instructions:

### Core Requirements
1. **User and Role Management**: Implemented via `/api/users` endpoints. Custom role mapping (`VIEWER`, `ANALYST`, `ADMIN`), active/inactive account toggling, and role upgrading logic are all fully built via Prisma Enums. 
2. **Financial Records Management**: Full CRUD enabled under `/api/records`. Includes complex filtering on `GET` (by date range, category, type) and a fuzzy search param over descriptions.
3. **Dashboard Summary APIs**: Complex aggregations exist under `/api/dashboard/*`. Features raw SQL processing for `netBalance`, `totalIncome`, category splits, and monthly trends. It is not just simple CRUD.
4. **Access Control Logic**: Strictly enforced via the highly reusable `authorize('ROLE')` Express middleware factory (e.g. shielding `POST /records` from Viewers). 
5. **Validation and Error Handling**: 100% of incoming payloads and queries are strictly validated using `Zod` schemas before hitting controllers. A global Express error handler catches Zod schema errors, mapped Prisma violations (e.g. 404s and 409s), and standard HTTP AppErrors.
6. **Data Persistence**: Uses a relational PostgreSQL database hosted on Neon, managed via Prisma ORM.

### Optional Enhancements Added
- **Authentication:** Fully robust JWT (JSON Web Token) authentication flow (`/api/auth/login`).
- **Pagination:** Record listing automatically uses `page` and `limit` skip/take logic returning total pages.
- **Search Support:** Implemented text-search filtering over multiple text columns simultaneously.
- **Soft Delete Functionality:** Records natively employ `isDeleted: true` instead of physically dropping rows.
- **API Documentation:** Complete, automated Open API spec and Swagger UI served natively over `/api/docs`.
- **Rate Limiting:** Protects backend endpoints against brute force and DDoS attacks (`express-rate-limit`).

---

## 🧠 Assumptions Made

1. **Role Assignment during Registration:** For the sake of this evaluation and easier testability, the `/api/auth/register` API accepts a `role` payload. In a strict real-world production environment, registration defaults to `VIEWER` and only an Admin can formally elevate a user to `ANALYST` or `ADMIN`.
2. **PostgreSQL as Source of Truth:** Assumed that the assignment required a highly robust, scalable database rather than a mock in-memory array. NeonDB was chosen for zero-config serverless isolation to prove scalability.
3. **Soft Deletion over Hard Deletion:** Financial systems require strict auditing. Assuming financial records should never actually be dropped from the database, a soft delete (`isDeleted: true`) pattern is universally applied. Admins flag the record, and the `GET` queries permanently filter it out.

---

## ⚖️ Tradeoffs Considered

1. **Vanilla CSS vs TailwindCSS**
   - *Tradeoff:* Tailwind allows for rapid prototyping, but I opted for Vanilla CSS with native CSS variables to demonstrate raw styling fundamentals and construct a custom Glassmorphism design system without heavy utility markup overhead.
2. **Aggregations in SQL vs Memory**
   - *Tradeoff:* For `/api/dashboard/by-month`, instead of pulling all records into Node.js and calculating totals using `reduce` arrays (which inevitably hits memory limits as scale increases), I utilized raw SQL `DATE_TRUNC` and `SUM` via `prisma.$queryRaw`. This pushes the computational load to Postgres, saving Node memory at the cost of slightly more complex raw query syntax.
3. **Monorepo Structure vs Separate Repos**
   - *Tradeoff:* The frontend React code is completely self-contained in a `frontend/` subdirectory rather than a completely separate Git repository. This allows the evaluator to seamlessly test both halves with a single `git clone`, though in enterprise scenarios they would likely be separated for independent CI/CD build pipelines.

---

## Testing the Deployed Backend APIs directly via Swagger

If you wish to test the APIs without the React frontend, the API is fully documented and interactive via **Swagger UI**.

1. Navigate to [`/api/docs`](https://backendzoroyn.onrender.com/api/docs) on the live server (or `localhost:3000/api/docs` locally).
2. Scroll to `POST /api/auth/login`, click **Try it out**, input `{"email": "admin@finance.dev", "password": "Password123!"}`, and hit Execute.
3. Copy the `token` string given in the response body.
4. Click the green **Authorize** button at the top of the page, paste your token, and apply it.
5. You can now execute and test all secured endpoints natively in your browser!
