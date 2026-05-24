# Hostel Management System (AVM Secondary School)

A role-based hostel operations platform for AVM Secondary School with secure PHP APIs, MySQL persistence, and dashboard workflows for Student, Receptionist, and Admin users.

## Current Highlights

- Role-based login with server session authentication
- CSRF protection for mutating API operations
- Login rate limiting and security-focused error handling
- Transaction-safe student payment submission with idempotency
- Audit logging for sensitive actions
- Admin Audit Logs page with filters, pagination, CSV export, risk badges, and auto-refresh
- Admin DB Health widget for live database/table visibility
- localStorage + server sync model with server-side authorization enforcement

## Role Features

### Student

- View bookings, room details, and notices
- View payment history and submit payment through secure backend endpoint
- Submit requests/complaints
- Update profile
- Change password (server-validated)

### Receptionist

- Check-in/check-out operations
- Visitor management
- Attendance management
- Outpass / gate pass operations
- Requests and payment desk operations (restricted by backend role rules)

### Admin / Owner

- Dashboard stats, rooms, students, payments, requests, notices
- Analytics charts
- Audit Logs monitoring page
- Audit Summary cards (24h failed/high-risk/top IP/top actor)
- DB Health panel (database name + key table counts)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | PHP 8 (PDO) |
| Database | MySQL |
| Charts | Chart.js |

## Project Structure

```text
Hostel-Management-System/
├── index.html
├── login.html
├── student-dashboard.html
├── receptionist-dashboard.html
├── owner-dashboard.html
├── styles.css
├── script.js
├── database.sql
├── security-audit.md
└── api/
    ├── auth.php
    ├── db.php
    ├── login.php
    ├── logout.php
    ├── session.php
    ├── sync.php
    ├── data.php
    ├── payments.php
    ├── change-password.php
    ├── audit-logs.php
    ├── audit-summary.php
    ├── db-health.php
    ├── setup.php
    ├── migrate.php
    └── version.php
```

## Database Model

Core tables:

- users
- rooms
- bookings
- payments
- requests
- visitors
- attendance
- notices
- outpasses
- audit_logs

## Security Model

- Session auth and role-based authorization in shared auth middleware
- CSRF token required on mutating endpoints
- Login brute-force protection via rate limiting
- Server-side input sanitation and table/role mutation guardrails
- Prepared statements with PDO
- Restricted setup/migrate execution contexts
  - setup.php: localhost only
  - migrate.php: CLI only

## Setup (XAMPP / Windows)

1. Place project in:

```text
C:\xampp\htdocs\Hostel-Management-System
```

2. Start Apache and MySQL in XAMPP.

3. Run migration from terminal (not browser):

```powershell
Set-Location C:\xampp\htdocs\Hostel-Management-System
& C:\xampp\php\php.exe .\api\migrate.php
```

4. Seed data from localhost:

```text
http://localhost/Hostel-Management-System/api/setup.php
```

5. Open app:

```text
http://localhost/Hostel-Management-System/login.html
```

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Receptionist | reception | rec123 |
| Student | student123 | pass123 |

## Audit Logs Notes

- By default, internal system events are hidden for cleaner security monitoring.
- Enable "Show system events" only when troubleshooting.
- Failed login attempts are intentionally logged and visible.

## Troubleshooting

### "migrate.php shows Forbidden"

- Expected behavior in browser.
- Run migrate.php via CLI only.

### "phpMyAdmin looks empty"

- Check selected database is `hostel_management`.
- Do not inspect a different database (for example `htm`).
- Re-run setup.php if needed.

### "UI changes not visible"

- Hard refresh with Ctrl+F5.
- Asset URLs are versioned in HTML.

## Academic Context

This project was developed for ICT capstone coursework (Semester 1, 2026).
