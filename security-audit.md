# Security Audit Report: Hostel Management System

Application: AVM Hostel Management System  
Stack: PHP 8.x + MySQL + Vanilla JavaScript  
Audit Date: 24 May 2026  
Audit Type: Code re-verification after hardening

---

## Executive Summary

The project has been significantly improved versus the original baseline audit. Most previously critical findings (missing auth, missing CSRF, open sync, offline auth bypass, exposed setup/migrate behavior) are now fixed.

Current status:

- Critical unresolved: 0
- High unresolved: 0
- Medium unresolved: 3
- Low unresolved: 4

Overall risk posture has improved from Critical to Moderate.

---

## Verified Fixes (Previously Reported Findings)

### Authentication and Authorization

- Fixed: server-side auth is enforced in protected APIs via `api/auth.php` + `require_auth(...)`.
- Fixed: CSRF checks are enforced on mutating endpoints via `require_csrf()`.
- Fixed: login fallback to local-only authentication is removed.
- Fixed: password change is session-bound (user id is not trusted from client payload).
- Fixed: login rate limiting exists (session/IP window in auth helpers).

### API and Data Exposure

- Fixed: `api/sync.php` now requires auth and is role-scoped (students receive only their own data).
- Fixed: generic server error responses are used (no raw stack/error leak in normal responses).
- Fixed: setup/migration access hardening:
  - `api/setup.php` localhost-only
  - `api/migrate.php` CLI-only

### Business Logic and Monitoring

- Fixed: payment submission moved to server endpoint `api/payments.php` with transaction handling and idempotency key checks.
- Fixed: audit logging implemented (`audit_logs` table + `audit_log(...)` helper + endpoint hooks).
- Fixed: admin audit monitoring UI/API implemented with filtering, pagination, and CSV export.

### Frontend Injection Hardening

- Improved: major sinks now use escaping helpers (`escHtml`, `escAttr`, `escJs`) in many high-risk render paths.
- Improved: payload sanitation runs before client persistence.

---

## New Corrections Applied In This Audit Pass

1. Prevented plaintext password persistence in localStorage:
- Password/password_hash fields are now stripped from local copies through `stripSensitiveFieldsDeep(...)`.
- Backend payload still carries password when needed for user creation/update hashing.

2. Duplicate-login noise control improvements already present:
- Frontend in-flight submit guard avoids double submit.
- Backend short-window duplicate-attempt suppression reduces duplicate audit rows/toasts.

3. Added baseline CSP policy on all UI entry pages:
- `login.html`, `owner-dashboard.html`, `receptionist-dashboard.html`, `student-dashboard.html` now include Content Security Policy via `<meta http-equiv="Content-Security-Policy">`.

4. Enforced safer DB credential behavior for production:
- `api/db.php` now refuses startup in `APP_ENV=production` when insecure default DB settings are still in use.

5. Escaped receipt-rendered dynamic fields:
- `printReceipt(...)` now escapes transaction/user/payment fields before HTML interpolation.

---

## Remaining Security Gaps

### Medium

1. Generic data endpoint remains broad for admin role
- `api/data.php` intentionally allows wide admin mutation capability.
- Risk: higher impact if an admin session is compromised.
- Recommendation: move sensitive actions (role updates, billing state changes) to dedicated endpoints with tighter checks.

2. Partial residual XSS surface in large UI file
- Many sinks are escaped; however, `script.js` is large and still has template HTML-heavy rendering.
- Recommendation: continue sink-by-sink hardening and prefer `textContent` where practical.

3. No server-side security event retention policy
- Audit table can grow unbounded.
- Recommendation: add retention/archive strategy (for example 90-day rolling archive).

### Low

6. External Chart.js script is loaded without SRI hash
- Recommendation: add `integrity` + `crossorigin` attributes.

7. No explicit CORS policy headers
- Same-origin default currently protects browser access.
- Recommendation: define explicit origin policy to avoid future misconfiguration drift.

8. Dynamic SQL identifier quoting pattern in `api/data.php`
- Current mapping is hardcoded, so exploitability is low.
- Recommendation: quote identifiers defensively for future-proofing.

9. Setup script still exists in repo
- Access-restricted, but safer to remove from production deployments after initialization.

---

## Priority Remediation Plan

### Priority 1 (Immediate)

1. Continue XSS hardening for remaining template-rendered sections.
2. Move CSP from meta tags to server-set response headers (stronger enforcement, easier central management).

### Priority 2 (Short Term)

3. Split sensitive admin mutations out of generic `api/data.php` into dedicated APIs.
4. Add audit log retention and archival policy.
5. Add SRI for Chart.js include.

### Priority 3 (Operational)

6. Document secure deployment checklist (remove setup endpoints in production, configure HTTPS/HSTS, lock DB user permissions).

---

## Conclusion

Security has improved substantially and the most dangerous baseline issues are resolved. The project is in a safer deployable state for controlled environments, with remaining work focused on medium/low hardening tasks and operational maturity.
