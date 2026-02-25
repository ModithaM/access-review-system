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

### Validation and Security

- Review `rating` validation (1-5)
- `ObjectId` validation for route and query filters
- Soft delete (`removed: true`) pattern
- Protected routes and ownership checks on update/delete
- Duplicate active review prevention per user+space

## 4) Testing Instructions (Current)

### Integration Testing (manual/API smoke)

Use Swagger or Postman to verify this flow:

1. Register/Login to get JWT
2. Create Public Space
3. Create Review
4. List/Search/Read Review
5. Update Review
6. Get Space Summary and Weather
7. Delete Review and confirm read returns 404

### Unit / Performance Testing

Not yet automated in this repository.

## 5) Deployment Checklist (for submission)

For final README submission include:

- Backend deployment platform + steps (Render/Railway/etc.)
- Environment variable list (without secrets)
- Live backend URL
- API docs URL
- Screenshots proving deployment and key endpoint responses

## 6) Team

- ModithaM
- Moditha2003
