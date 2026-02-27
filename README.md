# Access Review System - Backend API

Node.js + Express + MongoDB backend for a Public Space Accessibility platform.  
The system supports authentication, user management, public-space management, access-feature cataloging, and accessibility reviews (including weather context from Open-Meteo).

---

## 1) Project Overview

This API allows users to:

- Register and log in with JWT authentication.
- Manage user accounts (read, update, password update, list/search).
- Manage public spaces (create, list, update, delete, search by name).
- Manage accessibility features (create, list, update, soft delete).
- Create and manage accessibility reviews with validation, ownership checks, and analytics.
- Retrieve weather context for a public space based on stored coordinates.

### Core Modules

1. Authentication & Authorization
2. User Management
3. Public Space Management
4. Access Feature Management
5. Accessibility Review Management

---

## 2) Tech Stack

- Runtime: Node.js (package engine currently set to `14.x`)
- Framework: Express
- Database: MongoDB + Mongoose
- Auth: JWT (`x-auth-token` header) + session middleware
- Docs: Swagger UI (`swagger-jsdoc`, `swagger-ui-express`)
- Testing: Jest, Supertest, mongodb-memory-server
- Performance test: Artillery
- Package manager: pnpm

---

## 3) Project Structure

```text
access-review-system/
├─ app.js
├─ server.js
├─ docs/swagger.js
├─ controllers/
├─ routes/
├─ models/
├─ handlers/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ performance/
├─ seeder/
├─ setup/
└─ public/uploads/
```

---

## 4) Environment Variables

Create a file named `.variables.env` in the project root (copy from `sample.variables.env`).

Required variables:

| Variable     | Required | Description                                     |
| ------------ | -------- | ----------------------------------------------- |
| `DATABASE`   | Yes      | MongoDB connection string                       |
| `JWT_SECRET` | Yes      | Secret key used to sign/verify JWT tokens       |
| `SECRET`     | Yes      | Express session secret                          |
| `KEY`        | Yes      | Session cookie key                              |
| `PORT`       | No       | API port (default runtime uses `80` if missing) |
| `NODE_ENV`   | No       | e.g. `development`, `production`, `test`        |

Example is already provided in `sample.variables.env`.

---
