# LearnScroll

## Description

A backend API platform for online course management built with Bun and Hono. LearnScroll lets instructors create and manage courses with sections, lectures, and video content while students can browse and access course materials.

Key capabilities:
- User authentication with email verification, MFA, and password reset flows.
- Instructor registration and course authoring with rich content structure.
- Video upload via Cloudinary with signed uploads and webhook processing.
- Async email delivery via RabbitMQ with dead-letter queues and retry logic.
- Redis-backed temporary storage for verification codes and reset tokens.
- Cookie-based JWT authentication with access/refresh token rotation.

## Features

- Auth System - Email/password signup, email verification, MFA, password reset, session management with refresh token rotation.
- Course Management - Create courses with sections and lectures, control publishing status and enrollment privacy.
- Instructor Dashboard - Register as instructor, manage course catalog with pagination, filtering, and sorting.
- User Profiles - Manage profile details, profile picture upload to Cloudinary, privacy settings, and social links.
- Video Upload - Signed Cloudinary upload URLs for direct browser-to-cloud uploads with progress tracking.
- Async Processing - RabbitMQ worker handles all email sending asynchronously with dead-letter queue and retry.
- Security - Password hashing with bcrypt, JWT with httpOnly cookies, file type validation for uploads.
- Privacy Controls - Profile visibility and course enrollment visibility toggles per user.

## Tech Stack

- Runtime: Bun 1.x
- Language: TypeScript 5 (strict mode)
- Framework: Hono 4
- Database: PostgreSQL, Drizzle ORM
- Messaging: RabbitMQ
- Cache / Temp Storage: Redis
- Auth: bcryptjs, jsonwebtoken (cookie-based JWT)
- Media: Cloudinary
- Email: Resend
- Validation: Zod 4
- File Type Detection: file-type
- Dev Tooling: drizzle-kit, tsx

## Architecture

The application follows a modular monolith structure organized by domain. Each module owns its routes, controllers, and services with no cross-boundary leakage.

Core modules:
- `auth` - Signup, login, email verification, MFA, password reset, session management, refresh token rotation.
- `users` - Profile management, privacy settings, profile picture upload, MFA toggle.
- `instructors` - Instructor registration linked to existing user accounts.
- `courses` - Course CRUD with sections and lectures, split into admin (instructor) and user (browsing) routes.
- `video` - Cloudinary signature generation for direct upload and webhook verification.

Infrastructure:
- `shared/rabbitmq` - Connection management with reconnection logic.
- `shared/queue` - Email queue producer and consumer with dead-letter exchange and max 5 retries.
- `shared/redis` - Redis client for temporary data (pending signups, MFA codes, reset codes).
- `shared/database` - Drizzle ORM setup with PostgreSQL, schema definitions, and migrations.
- `shared/cloudinary` - Cloudinary client for image/video upload and webhook signature verification.
- `shared/validation` - Zod validation helper wrapping Hono's validator.
- `shared/middlewares` - JWT-based auth middleware reading tokens from httpOnly cookies.
- `shared/errors` - Custom error class with HTTP status codes.

## Setup Instructions

### Prerequisites
- Bun 1.x
- PostgreSQL running locally
- Redis running locally
- RabbitMQ running locally
- Cloudinary account
- Resend API key

### Steps

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Fill in credentials for database, Redis, RabbitMQ, Cloudinary, Resend and JWT secret
   ```

3. Push database schema:
   ```bash
   bun run db:push
   ```

4. Start the dev server:
   ```bash
   bun run dev
   ```

## Contributing

Contributions, issues, and feature requests are welcome.

## License

MIT License. Copyright (c) 2026 Mohammad Arkan.
