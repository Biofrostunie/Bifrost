# Bifrost API

A RESTful API for the Bifrost Financial Education and Management System, built with Node.js, Express, TypeScript, and Prisma.

## Features

- Complete user authentication system
- Financial management (income/expense tracking)
- Educational content for financial concepts
- Investment simulations
- Dashboard with financial metrics
- API documentation with Swagger
- tRPC integration
- SOLID architecture
- Prisma ORM
- Dockerized deployment

## Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Docker (optional)

## Getting Started

### Environment Setup

1. Clone the repository
2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database connection details and other configuration

### Installation

#### Without Docker

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the development server
npm run dev
```

#### With Docker

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec api npm run prisma:migrate
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Project Structure

```
bifrost-api/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Middleware functions
│   ├── models/             # Data models/schemas
│   ├── repositories/       # Data access layer
│   ├── routes/             # Route definitions
│   ├── services/           # Business logic
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── trpc/               # tRPC router definitions
│   ├── server.ts           # Server entry point
│   └── app.ts              # Application setup
├── prisma/                 # Prisma ORM files
│   └── schema.prisma       # Database schema
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `POST /api/v1/auth/reset-password` - Request password reset
- `POST /api/v1/auth/reset-password/confirm` - Confirm password reset

### User Management

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/password` - Update user password
- `DELETE /api/v1/users/account` - Delete user account

### Financial Management

- Income and Expense categories management
- Income and Expense tracking
- Investment simulations
- Dashboard data

### Education

- Financial concepts management
- Search and filter educational content

## tRPC Integration

The API also exposes a tRPC endpoint at `/trpc` for type-safe API calls from the frontend.
