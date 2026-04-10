# Physion Raise Management

Initial implementation scaffold for the Physiotherapy Clinic Management System.

## Stack

- Node.js + Express (monolith backend)
- MongoDB + Mongoose
- Session auth (`express-session` + `connect-mongo`)
- Vanilla HTML/JS frontend (no React runtime)
- Tailwind CSS v3 build pipeline

## Project Structure

- `server/` backend app, models, middleware, routes
- `client/public/` static HTML/JS/CSS served by Express
- `client/src/css/input.css` Tailwind source

## Quick Start

1. Copy env file:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Build Tailwind CSS once:
   - `npm run build:css`
4. Start development:
   - `npm run dev`
5. Open:
   - `http://localhost:5000`

## Useful Scripts

- `npm run seed` to create demo users/data.
- `npm test` to run API smoke tests.

## Auth Bootstrap

- Create initial admin account via API:
  - `POST /api/auth/register-admin`
  - Body: `{ "name": "Owner", "email": "admin@clinic.com", "password": "StrongPass123" }`
- Then login through `/login.html`.

## Implemented APIs (Initial)

- `GET /api/health`
- `POST /api/auth/register-admin`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/patients`
- `GET/POST/PATCH/DELETE /api/services`
- `GET/POST/PATCH/DELETE /api/appointments` (with therapist overlap check)
- `GET/POST/PATCH /api/sessions`
- `GET/POST/DELETE /api/finance/expenses`
- `GET /api/finance/summary/monthly`
- `GET /api/reports/appointments/status`
- `GET /api/reports/therapists/performance`
- `GET /api/users/therapists`

## Notes

- All major models include soft-delete fields (`isArchived`, `archivedAt`).
- Default queries exclude archived records.
- This is a high-quality base scaffold intended for feature completion in next iterations.
