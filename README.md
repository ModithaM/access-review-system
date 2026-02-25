# SE3040 Backend - Public Space Accessibility Platform

## 1) Backend Setup

1. Ensure `.variables.env` exists in this folder (copy from `sample.variables.env` if needed).
2. Ensure these keys exist in `.variables.env`: `DATABASE`, `JWT_SECRET`, `SECRET`, `KEY`.
3. Update `DATABASE` in `.variables.env` with your MongoDB connection string.
4. Install dependencies:
   - `pnpm install`
5. Optional initial setup:
   - `pnpm setup`
6. Start backend:
   - `pnpm start`

API base URL (local): `http://localhost:8888/api`

## 2) API Documentation

Swagger UI:

- `http://localhost:8888/api-docs`

## 3) Accessibility Review Component (Individual Task)

Implemented in:

- `models/AccessibilityReview.js`
- `controllers/reviewController.js`
- `routes/reviewApi.js`

### Relationship Mapping

- `AccessibilityReview.spaceId -> PublicSpace`
- `AccessibilityReview.userId -> User`
- Virtual relations:
  - `PublicSpace.accessibilityReviews`
  - `User.accessibilityReviews`

### Endpoints

- `POST /api/review/create` (auth required)
- `GET /api/review/read/:id`
- `PATCH /api/review/update/:id` (owner only)
- `DELETE /api/review/delete/:id` (owner/admin)
- `GET /api/review/list`
- `GET /api/review/search`
- `GET /api/review/my-reviews` (auth required)
- `GET /api/review/space/:spaceId`
- `GET /api/review/space/:spaceId/summary`
- `GET /api/review/space/:spaceId/weather` (third-party API integration via Open-Meteo)

### Functional Components (project-level)

This backend contains at least 4 clearly separated components:

1. **Authentication & Authorization** (`routes/authApi.js`, `controllers/authController.js`)
2. **Public Space Management** (`routes/publicSpaceApi.js`, `controllers/publicSpaceController.js`)
3. **Access Feature Management** (`routes/accessFeatureApi.js`, `controllers/accessFeatureController.js`)
4. **Accessibility Review Management** (`routes/reviewApi.js`, `controllers/reviewController.js`)
5. **User Management** (`routes/userApi.js`, `controllers/userController.js`)

### Validation and Security

- Review `rating` validation (1-5)
- `ObjectId` validation for route and query filters
- Soft delete (`removed: true`) pattern
- Protected routes and ownership checks on update/delete
- Duplicate active review prevention per user+space

## 4) Assignment Requirement Coverage (Accessibility Review Feature)

### Backend Requirements Checklist

- **RESTful CRUD endpoints + standard methods/statuses** ✅
  - Create (`POST /review/create`), Read (`GET /review/read/:id`), Update (`PATCH /review/update/:id`), Delete (`DELETE /review/delete/:id`), List/Search/summary endpoints
  - Standardized empty-list/search behavior to `200` with empty arrays
- **Additional third-party API feature** ✅
  - `GET /review/space/:spaceId/weather` using Open-Meteo API
- **MongoDB integration** ✅
  - Mongoose model, references (`spaceId`, `userId`), indexes, unique active review constraint
- **Protected routes & role-based access** ✅
  - JWT-protected create/update/delete/my-reviews
  - Owner-only update, owner-or-admin delete
- **Validation and error handling** ✅
  - ObjectId checks, rating range checks, comment/rating schema validation, duplicate-key handling, standardized error responses
- **Clean architecture & best practices** ✅
  - Route/controller/model separation, soft-delete pattern, pagination, filtered queries, Swagger docs
- **API documentation (Swagger/Postman)** ✅
  - Swagger enabled at `/api-docs`, reusable schema definitions included

## 5) Testing Instructions

### Install test dependencies

- `pnpm install`

### Unit testing

- `pnpm test:unit`

### Integration testing

- `pnpm test:integration`

### Run all tests

- `pnpm test`

### Integration Testing (manual/API smoke)

Use Swagger or Postman to verify this flow:

1. Register/Login to get JWT
2. Create Public Space
3. Create Review
4. List/Search/Read Review
5. Update Review
6. Get Space Summary and Weather
7. Delete Review and confirm read returns 404

### Performance testing (Artillery)

1. Start server:
   - `pnpm start`
2. Run load test:
   - `pnpm test:performance`

Artillery scenario file:

- `performance/review-list.yml`

## 6) Deployment Checklist (for submission)

For final README submission include:

- Backend deployment platform + steps (Render/Railway/etc.)
- Environment variable list (without secrets)
- Live backend URL
- API docs URL
- Screenshots proving deployment and key endpoint responses

## 7) Team

- ModithaM
- Moditha2003
