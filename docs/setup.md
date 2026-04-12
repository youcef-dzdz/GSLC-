# Setup Guide

## Prerequisites
- PHP 8.3+
- Composer
- Node.js 20+
- PostgreSQL 15+

## Local Development

### 1. Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate --seed
php artisan serve          # Runs on http://localhost:8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
cp .env.example .env
# .env already has: VITE_API_URL=http://localhost:8000
npm run dev                # Runs on http://localhost:5173
```

## Default Credentials (dev only)
| Role       | Email                          | Password              |
|------------|--------------------------------|-----------------------|
| Admin      | gslc.admin@gmail.com           | Gslcadmin1990@        |
| Commercial | gslc.commercial@gmail.com      | Gslccommercial1990@   |
| Logistique | gslc.logistique@gmail.com      | Gslclogistique1990@   |
| Financier  | gslc.financier@gmail.com       | Gslcfinancier1990@    |
| Directeur  | directeur@nashco.dz            | Gslcdirecteur1990@    |
