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

## 5) Getting Started

### Prerequisites

- Node.js + pnpm
- MongoDB instance (local or cloud)

### Install

```bash
pnpm install
```

### Run (development / local)

```bash
pnpm start
```

Default local URLs (based on current sample env):

- API base: `http://localhost:8888/api`
- Swagger docs: `http://localhost:8888/api-docs`

### Development mode (auto-reload)

```bash
pnpm dev
```

---

## 6) Authentication Model

The API uses JWT via custom header:

- Header name: `x-auth-token`
- Value: raw JWT token string

How it works:

1. Call `POST /api/login`.
2. Receive `result.token`.
3. Include that token in `x-auth-token` for protected endpoints.

Token middleware behavior (`isValidToken`):

- Rejects missing token (`401`).
- Rejects invalid/expired token (`401`/`500` depending on failure path).
- Rejects users not found or already logged out.
- Injects authenticated user into `req.user` on success.

---

## 7) Data Models

### 7.1 User (`models/User.js`)

Key fields:

- `email` (unique, required, lowercase/trimmed)
- `password` (required)
- `userType` (`admin` | `user` | `guest`, default `user`)
- `name`, `surname` (required)
- `removed` (default `false`)
- `enabled` (default `true`)
- `isLoggedIn` (boolean)
- `createdAt`

Helpers:

- `generateHash(password)`
- `validPassword(password)`

Virtuals:

- `accessibilityReviews` (inverse relation via `userId`)

### 7.2 PublicSpace (`models/PublicSpace.js`)

Key fields:

- `name` (required)
- `category` (`Mall` | `Park` | `Hospital` | `Station` | `Other`)
- `locationDetails.address` (required)
- `locationDetails.coordinates.lat/lng` (required)
- `imageUrl` (default path)
- `description`
- `timestamps`

Virtuals:

- `accessibilityReviews` (inverse relation via `spaceId`)

### 7.3 AccessFeature (`models/AccessFeatures.js`)

Key fields:

- `name` (required, unique)
- `description` (required)
- `category` (`Mobility` | `Visual` | `Auditory` | `Cognitive` | `Other`)
- `isActive` (default `true`)
- `createdBy` (required ref to `User`)
- `timestamps`

### 7.4 AccessibilityReview (`models/AccessibilityReview.js`)

Key fields:

- `spaceId` (required ref `PublicSpace`, indexed)
- `userId` (required ref `User`, indexed)
- `rating` (required number, 1-5)
- `comment` (required, 10-1000 chars)
- `title` (max 100)
- `features[]` with:
  - `featureName` (required)
  - `available` (boolean)
  - `condition` (`excellent` | `good` | `fair` | `poor` | `not_available`)
- `removed` (soft delete flag)
- timestamps

Important indexes:

- Unique partial index to prevent duplicate active reviews:
  - `{ spaceId: 1, userId: 1 }` where `removed: false`
- Listing indexes:
  - `{ spaceId: 1, createdAt: -1 }`
  - `{ userId: 1, createdAt: -1 }`

---

## 8) API Reference (Complete)

Base URL: `/api`

### 8.1 Auth APIs

| Method | Endpoint    | Auth | Description                         |
| ------ | ----------- | ---- | ----------------------------------- |
| POST   | `/login`    | No   | Login and receive JWT token         |
| POST   | `/register` | No   | Register a new user                 |
| POST   | `/logout`   | Yes  | Logout currently authenticated user |

### 8.2 User APIs

All `/api/user/*` routes are protected by token middleware at router mount level.

| Method | Endpoint                                       | Description                     |
| ------ | ---------------------------------------------- | ------------------------------- |
| GET    | `/user/read/:id`                               | Get user by ID                  |
| PATCH  | `/user/update/:id`                             | Update user fields              |
| DELETE | `/user/delete/:id`                             | Delete user document            |
| GET    | `/user/search?q=...&fields=name,surname,email` | Search users by selected fields |
| GET    | `/user/list?page=1&items=10`                   | Paginated user list             |
| PATCH  | `/user/password-update/:id`                    | Update password                 |

### 8.3 Public Space APIs

| Method | Endpoint                     | Auth | Description                                |
| ------ | ---------------------------- | ---- | ------------------------------------------ |
| POST   | `/public-space/create`       | Yes  | Create public space                        |
| GET    | `/public-space/list`         | No   | List all public spaces                     |
| PATCH  | `/public-space/update/:id`   | Yes  | Update public space                        |
| DELETE | `/public-space/delete/:id`   | Yes  | Delete public space                        |
| GET    | `/public-space/search/:name` | No   | Search by name (partial, case-insensitive) |

### 8.4 Access Feature APIs

| Method | Endpoint               | Auth | Description                                     |
| ------ | ---------------------- | ---- | ----------------------------------------------- |
| POST   | `/access-features`     | Yes  | Create access feature                           |
| GET    | `/access-features`     | No   | List all features (`?activeOnly=true` optional) |
| GET    | `/access-features/:id` | No   | Get one feature by ID                           |
| PUT    | `/access-features/:id` | Yes  | Update feature                                  |
| DELETE | `/access-features/:id` | Yes  | Soft delete (deactivate) feature                |

### 8.5 Accessibility Review APIs

| Method | Endpoint                         | Auth | Description                                   |
| ------ | -------------------------------- | ---- | --------------------------------------------- |
| POST   | `/review/create`                 | Yes  | Create review                                 |
| GET    | `/review/read/:id`               | No   | Get review by ID                              |
| PATCH  | `/review/update/:id`             | Yes  | Update review (owner only)                    |
| DELETE | `/review/delete/:id`             | Yes  | Delete review (owner or admin, soft delete)   |
| GET    | `/review/list`                   | No   | Paginated list with optional filters          |
| GET    | `/review/search?q=...`           | No   | Search by title/comment (`spaceId` optional)  |
| GET    | `/review/my-reviews`             | Yes  | Current user reviews                          |
| GET    | `/review/space/:spaceId`         | No   | Reviews for one public space                  |
| GET    | `/review/space/:spaceId/summary` | No   | Aggregate summary for a public space          |
| GET    | `/review/space/:spaceId/weather` | No   | Weather integration for public space location |

---

## 9) API Usage Notes

### Common pagination query params

- `page` (default `1`)
- `items` (default `10`, max `100` in review APIs)

### Review list filters (`GET /api/review/list`)

- `spaceId`
- `userId`
- `minRating` (1-5)
- `maxRating` (1-5)

Validation rules include:

- ObjectId format checks for route/query IDs.
- `minRating <= maxRating` enforcement.

### Search behavior

- `GET /api/review/search` requires `q`.
- `GET /api/user/search` requires both `q` and `fields`.

### Third-party API integration

- `GET /api/review/space/:spaceId/weather` calls Open-Meteo API with space coordinates.
- Uses timeout and response-size guards in controller logic.

---

## 10) Response Patterns

Most endpoints follow a consistent JSON pattern:

```json
{
  "success": true,
  "result": {},
  "message": "..."
}
```

Some module endpoints (public-space/access-features) use `data` instead of `result`.

Typical HTTP status usage across modules:

- `200` OK (read/list/update/delete success depending on endpoint)
- `201` Created (create success)
- `400` Validation/input errors
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `409` Conflict (duplicate active review)
- `500` Server/internal errors

---
