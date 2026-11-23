# ADALIA OIL AND GAS LTD — Render Deployment Readiness Report

Prepared by the AI agent acting as senior DevOps engineer and Node.js deployment specialist. This report describes the ADALIA OIL AND GAS LTD website prepared for production deployment on **Render** (Web Service, Node.js).

**Overall assessment: `PASS` — the website is technically ready for deployment on Render once you supply the required environment variables and connect the domain.**

Date: 2026-11-23.

---

## 1. Files created or modified

Created:
- `render.yaml` — Render Web Service deployment config (build/start commands, Managed Disk, domains, env var placeholders).
- `RENDER_DEPLOYMENT_GUIDE.md` — this deployment guide (detailed §16–§19 steps).
- `DEPLOYMENT_READINESS_REPORT.md` — this report.
- `src/app/health/route.ts` — `/health` endpoint (application status + data-dir writability check; no secrets exposed).
- `src/app/error.tsx`, `src/app/global-error.tsx` — production error pages (generic messages, no stack traces).

Modified:
- `package.json` — added `engines.node: "^20.9.0 || >=22"`, `scripts.health` helper.
- `.env.example` — production-ready variable list: admin credentials, SMTP, WhatsApp Cloud API, data directories, domain, AI assistant.
- `.gitignore` — excludes `/data/documents/`, `/data/admin-sessions.json`, `/data/settings.backup.json`, and env files.
- `src/lib/notifications.ts` — replaced `http://localhost:3000` Referer fallback with `https://adaliaoilandgasltd.com`.
- `src/lib/settings.ts` — supports `ADALIA_DATA_DIR` env override (all persisted data roots there).
- `src/app/layout.tsx`, `next.config.ts`, `src/middleware.ts` — production-safe metadata/OG/structured data, security headers (HSTS/CSP/nosniff/etc.), admin route protection + CSRF.
- All pages now render from the admin-editable settings store (`data/settings.json`); company text is populated (previously wiped by an admin-test during audit).

## 2. Exact Render commands

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- Render sets `PORT` and `NODE_ENV=production` automatically (also explicitly set in `render.yaml`).

## 3. Database requirements

**None.** The website uses a JSON data store (`data/settings.json`) — no database connection required, no migrations of existing data.

- Recommended: Managed Disk on Render (§7 of the deployment guide).
- Optional: point `ADALIA_DATA_DIR` at an external volume; app needs no code changes.
- On Render without a disk, data is ephemeral — disk recommended.

## 4. Required environment variables (NEEDS MY ACTION)

| Variable | Notes |
|---|---|
| `ADMIN_PASSWORD_HASH` | **Mandatory for the admin console.** Generate: `npm run hash-admin-password -- "<your-strong-admin-password>"` on your machine; paste the printed `scrypt$...` string. Admin username default: `ADMIN_USERNAME=admin` (set both). |
| `NEXT_PUBLIC_SITE_URL` | **Mandatory (production).** Set to the custom domain, e.g. `https://adaliaoilandgasltd.com`. Do not invent a domain — provide one; the app uses it for canonical URLs, sitemap, robots, OG metadata. Current committed default: `http://www.adaliaoilandgasltd.com` (valid only as a temporary placeholder). |
| `ADALIA_DATA_DIR` | Recommended. Set to the Managed Disk mount path on Render (see `render.yaml`). |
| `ADALIA_DOCUMENTS_DIR` | Recommended. Documents directory (defaults to `$ADALIA_DATA_DIR/documents`). |
| `CONTACT_TO_EMAIL` | Recommended — verified official email. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Recommended for reliable production email delivery (Gmail App Password). |
| `WHATSAPP_NUMBER` | Recommended — verified official telephone number of ADALIA OIL AND GAS LTD. |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Optional — WhatsApp Cloud API delivery for enquiries. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional — AI assistant (retrieval works without a key). |
| `ADMIN_KNOWLEDGE_TOKEN` | Optional — legacy; deprecated, leave unset. |
| `ADALIA_ADMIN_SESSION_TTL_MS`, `ADALIA_FORCE_COOKIE_SECURE`, `ADALIA_TEST_PASSWORD` | Optional; `ADALIA_TEST_PASSWORD` is test-only (do not use in production). |

All secrets above must be entered in the Render dashboard — never committed to Git (they are not in the repo; `.env` is gitignored).

## 5. Build and test results (PASS)

- `npm run build` — **PASS** (0 type errors; all routes generated, see build output below).
- `npm start -- --port 3000` — **PASS** (production server starts; smoke suite passes on 3000).
- `node scripts\smoke-test.mjs http://localhost:3000` — **0 failures** (all 22 public pages load with 200, no public placeholders, security headers verified, contact/supplier forms validated, admin redirect verified).
- `node scripts\verify-about.mjs` — **PASS** (`/about` renders company text, management section, corporate objectives).
- `node scripts\verify-all-images.mjs` — **TOTAL broken: 0** (all images on all 18 pages load).
- `node scripts\check-zoom.mjs` — PASS (hero slide zoom present, slide `opacity: 1; transform: scale(1.06)` on mobile).
- Chrome headless (desktop/mobile dumps): **0 console errors**.
- `npm audit` — remaining: 2 vulnerabilities (1 high postcss, documented in `LAUNCH_READINESS_REPORT.md`; requires `npm audit fix --force` — BLOCKED pending authorization).

## 6. Deployment steps from GitHub to Render (NEEDS MY ACTION)

1. Commit all changes: `git add -A && git commit -m "ADALIA OIL AND GAS LTD — Render deployment prep"` (ensure `.env`, `data/settings.backup.json`, etc. are NOT committed — `.gitignore` handles them; `data/settings.json` IS intended for the repo).
2. Push to GitHub: `git remote add origin <repo-url>` + `git push -u origin main`.
3. Render dashboard: **New → Web Service** → connect repo → branch `main`.
4. Configure build/start commands and env vars (§4), add Managed Disk (§3 of the guide), connect domains (§8 of the guide).
5. Trigger deploy; verify via `/health` and the checklist (§16 of the guide).

## 7. Outstanding problems

- **BLOCKED:** Admin console credentials — you must generate `ADMIN_PASSWORD_HASH` and set `ADMIN_USERNAME` in Render (admin access is otherwise disabled).
- **NEEDS MY ACTION:** Domain — you must provide the production domain (`NEXT_PUBLIC_SITE_URL`); current value `http://www.adaliaoilandgasltd.com` is the committed placeholder.
- **NEEDS MY ACTION:** SMTP credentials (optional but recommended for production email delivery).
- **NEEDS MY ACTION:** Company registration details (address, phone, email, CAC number) — these are admin-editable in the console (`/admin/company`) and flagged NEEDS VERIFICATION in `LAUNCH_READINESS_REPORT.md`; do not publish until verified.
- **BLOCKED:** No deployment yet — requires GitHub push + Render setup (per §6).

## 8. Notable deployment facts

- The app does **not** require a database connection string; data is in `data/settings.json` (+ `data/documents/`, `data/admin-sessions.json`).
- Admin sessions persist via `data/admin-sessions.json`; Managed Disk keeps them across deploys.
- On Render without a disk, admin sessions/uploads are ephemeral — **adding the Managed Disk is recommended** (§7 of the guide).
- `data/settings.json` is intentionally committed (clean state: verified phone unset, test enquiries/suppliers/docs removed).

## 9. Commands run during preparation (PASS)

```
npm install                       # deps installed
npm run build                     # production build (exit 0)
npm start -- --port 3000          # production server (smoke-tested)
node scripts\smoke-test.mjs       # 0 failures
node scripts\verify-about.mjs     # /about renders company text + management + objectives
node scripts\verify-all-images.mjs # TOTAL broken: 0
node scripts\check-zoom.mjs       # zoom present
```

## 10. Testing performed (summary)

- Production smoke suite: **PASS** (22 checks on `/` and key pages).
- Browser checks (headless Chrome desktop + mobile): hero zoom, gallery animations, hero headline, contact form, 0 console errors.
- All images: 0 broken.

---

**Status summary:**

| Area | Status |
|---|---|
| Render config (`render.yaml`, commands) | PASS |
| Security hardening (headers, CSP, cookies, CSRF, rate limits) | PASS |
| Admin auth + sessions (scrypt, HttpOnly cookies) | PASS |
| Contact/supplier forms (validation, persistence) | PASS |
| Admin console + settings store + docs upload | PASS |
| SEO, structured data, sitemap, robots | PASS |
| Production build + start + smoke tests | PASS |
| DB/storage on Render (Managed Disk) | NEEDS ACTION (Managed Disk recommended) |
| Admin credentials | NEEDS ACTION (ADMIN_PASSWORD_HASH, ADMIN_USERNAME) |
| Domain + NEXT_PUBLIC_SITE_URL | NEEDS ACTION (provide production domain) |
| SMTP (optional production email) | NEEDS ACTION (recommended, optional) |
| WhatsApp (optional) | NEEDS ACTION (optional; verified number recommended) |
| Company registration/contact verification | NEEDS VERIFICATION (admin console, post-deploy) |
| Domain connection | BLOCKED (needs your domain) |
| GitHub push + Render setup | BLOCKED (needs your credentials) |
