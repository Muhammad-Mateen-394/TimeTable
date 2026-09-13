# Backend Setup

## Requirements

- PHP 8.3+ for the requested Laravel 13 target. This machine currently has PHP 8.2, so the checked-in backend was scaffolded and verified on Laravel 12.69.1.
- Composer
- MySQL 8.x for the deployment database

## Local setup

```bash
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

Set `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env` before migrating. The local scaffold may use SQLite for quick checks, but production should use MySQL.

In the frontend, create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing environment variables. Requests use `credentials: include`; Laravel Sanctum provides the CSRF cookie and session authentication.

## Development accounts

All seeded accounts use `demo1234`:

- `principal@alfalah.edu.pk`
- `manager@alfalah.edu.pk`
- `teacher@alfalah.edu.pk`

These credentials are development-only and must be replaced or removed for production.

## Verification

```bash
php artisan test
php artisan migrate:fresh --seed
```

The current feature coverage verifies login, dashboard access, teacher write protection, and manager timetable generation with a quality score.
