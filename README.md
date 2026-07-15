<div align="center">

# Social Feed API

A production-ready RESTful API for a social feed application built with NestJS, Prisma, and PostgreSQL.

[![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-UNLICENSED-lightgrey)](#)

</div>

---

## Overview

A full-featured social feed backend with JWT authentication, cursor-based pagination, image uploads via Cloudinary, and comprehensive security measures. Designed with thin controllers, service-layer business logic, and Prisma's `select`-based queries to prevent N+1 problems.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Auth | Passport + JWT (access + refresh tokens) |
| Password Hashing | Argon2 |
| Image Upload | Cloudinary (via multer memory storage) |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (OpenAPI 3) |
| Security | Helmet, Rate Limiting (ThrottlerModule) |

## Features

### Authentication & Authorization
- JWT-based authentication with access tokens (15 min) and refresh tokens (7 days)
- Refresh token rotation with argon2 hashed tokens stored in database
- Global `JwtAuthGuard` — all routes protected by default, `@Public()` decorator to skip
- Generic error messages for login failures to prevent user enumeration
- Per-route rate limiting: 5 req/min on login/register, 20 req/min on refresh

### Posts (CRUD)
- Create, read, update, delete posts with optional image upload
- Ownership enforcement — only authors can edit/delete their posts
- Visibility control: `PUBLIC` or `PRIVATE`
- Image upload to Cloudinary with automatic cleanup on post deletion/replacement

### Comments & Replies
- Two-level comment system (comments on posts, replies on comments)
- No reply nesting beyond one level
- Cursor-based pagination for both comments and replies

### Likes
- Toggle like/unlike on posts and comments
- Duplicate prevention via unique constraints (`userId + postId`, `userId + commentId`)
- Paginated list of users who liked a post or comment

### Cursor Pagination
- Base64url-encoded cursors containing `{ createdAt, id }` for stable ordering
- Configurable page limits with enforced maximum (50)
- Applied consistently across posts, comments, replies, and like lists

### Image Upload
- Multer memory storage (no disk writes)
- Supported formats: JPEG, JPG, PNG, WebP
- 5 MB file size limit
- Custom validation pipes (required and optional variants)
- Cloudinary integration with auto quality and format optimization

### Swagger Documentation
- Available at `/api/docs` in development
- Persisted authorization for testing
- Full request/response schemas for all endpoints

## Architecture

```
src/
├── main.ts                          # Bootstrap, global pipes, CORS, Helmet
├── app.module.ts                    # Root module composition
├── config/
│   └── env.validation.ts            # Startup environment validation
├── swagger/                         # Swagger configuration and setup
├── prisma/                          # Global PrismaService
├── common/
│   ├── dto/                         # Base DTOs (API response, pagination)
│   ├── filters/                     # Global exception filter
│   ├── lifecycle/                   # Shutdown hooks
│   ├── types/                       # Shared types (AuthorSummary)
│   └── utils/                       # Cursor encoding, response builders
└── modules/
    ├── auth/                        # JWT strategies, guards, login/register
    ├── users/                       # User profile, avatar upload
    ├── posts/                       # Post CRUD, feed generation
    ├── comments/                    # Comments and replies
    ├── likes/                       # Like toggle, liker lists
    └── uploads/                     # Cloudinary provider, multer config, validation pipes
```

### Design Principles
- **Thin controllers** — delegate all logic to services
- **Service-layer business rules** — ownership checks, access control, data orchestration
- **Prisma `select` over `include`** — explicit column selection for minimal payloads
- **Module isolation** — each feature is a self-contained NestJS module with clear imports/exports

## Database Design

### Models

**User** — Stores authentication credentials and profile data. Password and refresh token hashes are stored separately.

**Post** — Content with optional Cloudinary image, visibility flag, and cascading author relation.

**Comment** — Supports two-level threading via nullable `parentId` self-relation. Top-level comments reference a `postId`; replies reference a `parentId`.

**Like** — Polymorphic like relation (either `postId` or `commentId` is set). Unique constraints enforce one like per user per entity.



## API

All endpoints are prefixed with `/api/v1`. Full interactive documentation is available via Swagger at `/api/docs`.

### Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register (rate limited: 5/min) |
| POST | `/auth/login` | Login (rate limited: 5/min) |
| POST | `/auth/refresh` | Refresh tokens (rate limited: 20/min) |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me/avatar` | Upload avatar |
| POST | `/posts` | Create post (multipart) |
| GET | `/posts` | Get feed (cursor pagination) |
| GET | `/posts/:id` | Get post details |
| PATCH | `/posts/:id` | Update post (multipart) |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:postId/comments` | Create comment |
| GET | `/posts/:postId/comments` | Get comments (cursor pagination) |
| POST | `/comments/:commentId/replies` | Create reply |
| GET | `/comments/:commentId/replies` | Get replies (cursor pagination) |
| POST | `/posts/:id/like` | Toggle post like |
| POST | `/comments/:id/like` | Toggle comment like |
| GET | `/posts/:postId/likes` | Get post likers (cursor pagination) |
| GET | `/comments/:commentId/likes` | Get comment likers (cursor pagination) |

### Response Format

All responses follow a consistent wrapper:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

Auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`) and `/users/me` return data without the wrapper.

## Security

| Feature | Implementation |
|---------|---------------|
| JWT Authentication | Global `JwtAuthGuard` via `APP_GUARD` — every route requires a valid Bearer token unless `@Public()` is used |
| Refresh Token Rotation | Refresh tokens are argon2-hashed before DB storage; raw token validated on each refresh |
| Password Hashing | Argon2 (memory-hard, resistant to GPU attacks) |
| Generic Auth Errors | "Invalid email or password" for both missing users and wrong passwords |
| DTO Validation | Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues` |
| Environment Validation | All env vars validated at startup — app crashes immediately on missing config |
| Helmet | Security headers including CSP (custom in dev, default in production) |
| Rate Limiting | Global 100 req/min (dev) / 60 req/min (prod) via `ThrottlerGuard`; tighter limits on auth routes |
| CORS | Configurable allowed origins via `CORS_ORIGINS` env var; credentials enabled |
| Ownership Enforcement | Post edit/delete require author match; verified in service layer |
| File Validation | Custom pipes validate MIME type (regex) and file size (5MB) before upload |


## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- Cloudinary account (for image uploads)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g., `15m`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g., `7d`) |
| `PORT` | Server port |
| `NODE_ENV` | `development` / `production` / `test` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Running

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod

# Production with migration
npm run start:migrate:prod
```


## Project Structure

```
backend/
├── prisma/
│   ├── migrations/          # Database migration history
│   └── schema.prisma        # Database schema
├── src/
│   ├── main.ts              # Application bootstrap
│   ├── app.module.ts        # Root module
│   ├── config/              # Environment validation
│   ├── swagger/             # API documentation setup
│   ├── prisma/              # PrismaService (global)
│   ├── common/              # Shared DTOs, filters, utils
│   └── modules/
│       ├── auth/            # Authentication
│       ├── users/           # User management
│       ├── posts/           # Posts CRUD
│       ├── comments/        # Comments & replies
│       ├── likes/           # Likes
│       └── uploads/         # Cloudinary integration
├── .env.example
├── package.json
└── tsconfig.json
```

## License

UNLICENSED
