# 🔐 SECURITY.md — Studium

Security practices to protect users and data.

---

## 1) Authentication & Sessions
- Use **JWT** access tokens (short TTL) + optional **refresh tokens**.
- Store tokens in `httpOnly` cookies or memory (avoid localStorage for long-lived tokens).
- Rotate tokens and invalidate on password change or logout.

## 2) Authorization (RBAC)
- Roles: `student`, `alumni`, `moderator`, `admin`.
- Enforce role checks in controllers/services.

## 3) Input Validation & Sanitization
- Validate with **Joi/Zod** on all write routes.
- Sanitize user content to prevent **XSS** (escape HTML/markdown).
- Limit payload sizes; reject dangerous file types.

## 4) Rate Limiting & Throttling
- Apply per-IP and per-user limits on login, posting, commenting.
- CAPTCHA on suspicious activity (optional).

## 5) CORS & Headers
- Restrict `CORS_ORIGIN` to known domains.
- Use Helmet to set secure headers (HSTS, no-sniff, frameguard).

## 6) File Security
- Validate MIME and size server-side.
- Use **virus scanning** or AV service for uploaded files if possible.
- Store only in S3/Cloudinary; do not keep binaries in DB.

## 7) Secrets Management
- Keep secrets in `.env` or provider vaults (AWS Secrets Manager).
- Never commit `.env`; rotate keys regularly.

## 8) Data Protection
- Hash passwords with **bcrypt** (10-12 rounds).
- Minimize PII; log only what’s necessary (never log tokens/passwords).
- Backups with encryption-at-rest on the provider.

## 9) Monitoring & Incident Response
- Centralized logging; alert on spikes in 4xx/5xx.
- Document incident runbooks and on-call contacts.
