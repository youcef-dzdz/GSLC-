# Architecture Overview

## Stack
| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19 + TypeScript + Vite        |
| Styling    | TailwindCSS v4                      |
| State      | TanStack Query + React Context      |
| Backend    | Laravel 12 + PHP 8.3                |
| Auth       | Laravel Sanctum (Bearer tokens)     |
| Database   | PostgreSQL 15                       |
| Deployment | Docker + Nginx (production)         |

## Project Structure
```
nashco/
├── frontend/     React SPA (port 5173 dev)
├── backend/      Laravel API (port 8000 dev)
├── infrastructure/ Docker + Nginx configs
└── docs/         This documentation
```

## Auth Flow
1. User submits credentials to `POST /api/login`
2. Laravel validates, returns Bearer token
3. Frontend stores token in `localStorage`
4. Every API request includes `Authorization: Bearer <token>`
5. On 401, token is cleared and user is redirected to login

## Role-Based Access
| Role       | Dashboard URL          |
|------------|------------------------|
| admin      | /admin/dashboard       |
| commercial | /commercial/dashboard  |
| logistique | /logistics/dashboard   |
| financier  | /finance/dashboard     |
| directeur  | /director/dashboard    |
| client     | /client/dashboard      |
