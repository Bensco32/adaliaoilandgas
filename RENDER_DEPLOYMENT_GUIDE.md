# ADALIA OIL AND GAS LTD — Render Production Deployment Guide

Specific instructions to deploy this Next.js 15.5 (React 19) website on **Render**. This site uses a JSON data store (`data/settings.json`) — **no PostgreSQL is required** — and uploads go to `data/documents/`.

## 1. Required Render account and services

- **Render account** (www.render.com) with a dashboard.
- **Services:** exactly one — a **Web Service** (Runtime: Node.js).
  - A **Managed Disk** is **recommended** (see §7): to keep uploaded documents, the settings store and admin sessions across deploys/restarts.
- **Domains:** your custom domain(s). Render enforces HTTPS automatically (via Let's Encrypt).

## 2. Recommended Render service type

**Web Service** — `runtime: node`.

- Node version: `20 LTS` or newer (`engines.node: "^20.9.0 || >=22"` in package.json).
- No addons, no managed databases, no workers, no cron jobs needed.

## 3. Build command

```
npm install && npm run build
```

- `npm install` — installs all dependencies listed in `package.json`.
- `npm run build` — runs `next build` and validates types/imports; produces the production build in `.next/`.

## 4. Start command

```
npm start
```

- This runs `next start` which binds the server to `0.0.0.0` and reads `PORT` from the environment (Render sets `PORT`; Render's web service also sets `NODE_ENV=production`).
- Set `NODE_ENV=production` explicitly in the dashboard (we do this in `render.yaml`) to be safe.
- Health endpoint: `GET /health` — polls application status (see §9).

## 5. Required environment variables

All secrets and production-only values must be set in **Render dashboard → Service → Settings → Environment**.
`render.yaml` (committed to the repo) contains placeholders; **do not commit real secrets** — they are stored in the dashboard, not the repo.

| Variable | Required? | Purpose / where to get the value |
|---|---|---|
| `ADMIN_PASSWORD_HASH` | **YES (admin access)** | Hash of the admin password. Generate with: `npm run hash-admin-password -- "<your-strong-admin-password>"` on your machine; paste the printed `scrypt$...` string. Choose your own password — this is your admin login (user: `ADMIN_USERNAME`, default `admin`). |
| `ADMIN_USERNAME` | Recommended | Admin console username (default `admin`). |
| `ADALIA_ADMIN_SESSION_TTL_MS` | Optional | Admin session lifetime ms (default 1800000 = 30 min). |
| `ADALIA_FORCE_COOKIE_SECURE` | Optional | `1` forces the admin cookie `Secure` flag (fine behind HTTPS). |
| `NEXT_PUBLIC_SITE_URL` | YES (production) | **Production domain**, e.g. `https://adaliaoilandgasltd.com`. Used in metadata, canonical URLs, sitemap, robots, OG tags. Do not invent another domain. |
| `ADALIA_DATA_DIR` | Recommended (Render) | Data directory (settings store, sessions, documents). On Render, set this to the Managed Disk mount path — see §7. |
| `ADALIA_DOCUMENTS_DIR` | Recommended (Render) | Directory for uploaded documents. Defaults to `$ADALIA_DATA_DIR/documents`. Set to the disk path as well. |
| `CONTACT_TO_EMAIL` | YES (production) | Email address for contact form submissions. Verify with ADALIA OIL AND GAS LTD first. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Recommended | SMTP delivery for enquiries (Gmail App Password recommended). Without SMTP, enquiries go via the FormSubmit relay (credential-free) — still functional, but less reliable for production. |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_NUMBER` | Optional | WhatsApp Cloud API for enquiries; without them the form offers a "Continue on WhatsApp" link. `WHATSAPP_NUMBER` MUST be the verified official number of ADALIA OIL AND GAS LTD (tests assert the correct format). |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional | Enables live AI responses for the ADALIA AI Assistant; retrieval works without a key. |
| `ADMIN_KNOWLEDGE_TOKEN` | Optional (legacy) | Deprecated; use the admin console instead. Leave unset. |
| `NODE_ENV` | Auto (set explicitly) | Set to `production`. |

**Test-only variable (do not use in production):** `ADALIA_TEST_PASSWORD` — password used by `scripts/admin-test.mjs` against the admin console during development/testing.

## 6. Database setup and connection instructions

**The website does not require a database.** It uses a JSON data store:

- `data/settings.json` — company profile, services, projects, compliance certificates, HSE policies, governance docs, supplier applications, enquiries, activity log.
- `data/admin-sessions.json` — admin console sessions.
- `data/documents/` — uploaded files (certificates, policies, project photos).

**Recommended: Managed Disk on Render** (see §7) so all persisted data survives deploys and restarts.

**Alternative (optional):** point the app at an external persistent volume by setting `ADALIA_DATA_DIR` to that volume's mount path — no code changes needed.

**Migration from local to production:** the store is self-contained:
1. On your machine, the app has `data/settings.json` etc. (verified: `data/settings.json` is committed to the repo).
2. On Render: enable the Managed Disk, then either
   - (a) copy your local `data/` files to the disk after first deploy, or
   - (b) set `ADALIA_DATA_DIR` to the disk path — the app will seed from the committed `settings.json` on first boot if the store is missing.

**Connecting to an external database (if you want one):** not implemented — the app is designed around the JSON store. To move to PostgreSQL you would implement a storage layer — not required for this launch.

## 7. Persistent storage requirements (Managed Disk)

On Render, all persisted data lives on disk. To ensure it survives deploys/restarts:

1. In the Render dashboard for the service, add: **Settings → Managed Disk** (`disk: type: persistent` in `render.yaml`).
2. Set `ADALIA_DATA_DIR` to the disk mount path (per `render.yaml`: `/var/www/adalia/data`).
3. Set `ADALIA_DOCUMENTS_DIR` to `$ADALIA_DATA_DIR/documents` (or a subdir of your choice).
4. Deploy — the app will write `settings.json`, `admin-sessions.json` and uploaded documents there.

Without a disk, data lives in the container filesystem and is lost on restart — use a disk for production.

## 8. Custom domain connection instructions

1. Buy/control the domain (`adaliaoilandgasltd.com`, `www.adaliaoilandgasltd.com` — or your own).
2. In the Render dashboard → service → **Domains**: add both domains (or the apex; Render redirects apex → primary if the primary is `www`).
3. Set the **primary domain** (the one you want as canonical).
4. Update `NEXT_PUBLIC_SITE_URL` to the production domain (e.g., `https://adaliaoilandgasltd.com`) — required for canonical URLs, OG tags, sitemap, robots.
5. Render provisions Let's Encrypt HTTPS automatically — verify at `https://adaliaoilandgasltd.com/robots.txt` (the sitemap URL inside should use the production domain).
6. Update the "DNS" (CNAME to Render's default) at your registrar; verify with `dig`/`nslookup` after a few minutes.

**HTTPS:** Render enforces HTTPS for custom domains. Verify with `curl -I https://adaliaoilandgasltd.com/` (expect `HTTP/2 200` + `x-content-type-options: nosniff` etc.).

## 9. Health checks and reliability

- **Health endpoint:** `GET /health` — returns `{ status: "ok", ok: true, dataDir, environment, timestamp }` with **200** when operational, **500** when the data dir is not writable. Poll this endpoint from your monitoring/CI.
- **Graceful shutdown:** `next start` (Render) handles SIGTERM for graceful shutdown; no custom handlers needed.
- **Unhandled exceptions:** `src/app/error.tsx`, `src/app/global-error.tsx` render generic error pages (no stack traces). On 4xx/5xx API responses, errors are generic strings without internals.
- **Temporary failures:** SMTP/FormSubmit failures return clear user-facing errors; FormSubmit relays when SMTP isn't configured (recommended: configure SMTP). If the site is down, Render restarts it (no background processes in the app).
- **Recovery from data loss:** `data/settings.json` + `data/documents/` + `data/admin-sessions.json` on the Managed Disk. Backups: create periodic snapshots of the disk (see §13).

## 10. Deployment from GitHub to Render

1. `git init` (if not already), add and commit all changes (`git add -A && git commit -m "prepare ADALIA OIL AND GAS LTD for Render"`).
   - ⚠️ **Do not commit secrets**: `.env`, `.env.local`, `data/settings.backup.json`, SSH keys, passwords. `.gitignore` covers `.env*`, `/data/documents/`, `/data/admin-sessions.json`, `/data/settings.backup.json`.
2. Push to GitHub: `git remote add origin <your-repo>` (or use an existing repo) + `git push -u origin main`.
3. In the Render dashboard:
   - **New → Web Service** → connect your repo → select the repo and branch (`main`).
   - Set the **Build command** (`npm install && npm run build`), **Start command** (`npm start`) — or import from `render.yaml` if you prefer (see §15).
   - Add the Managed Disk (§7) and environment variables (§5).
   - **Connect domain(s)** (§8).
4. Trigger a deploy (Render does it automatically on push).
5. **Verify** (§11).

## 11. How to verify a successful deployment

- **Dashboard:** Service status = **"Live"**; log stream shows `✓ Ready in Xms`.
- **Health:** `curl https://<your-domain>/health` → `200` with `status: "ok"`.
- **Public pages:** `curl -I https://<your-domain>/` → `200`; `/about`, `/services`, `/hse`, `/compliance`, `/governance`, `/projects`, `/suppliers`, `/contact`, `/faq`, `/privacy`, `/terms`, `/cookie-policy` → `200`.
- **Sitemap:** `https://<your-domain>/sitemap.xml` contains the production domain.
- **Robots:** `https://<your-domain>/robots.txt` — sitemap URL uses the production domain; `/admin`, `/api`, `/documents`, `/data` are disallowed.
- **Contact form:** `curl -X POST https://<your-domain>/api/contact` with JSON `{fullName, email, division, subject, message}` → `200` (delivered via SMTP/relay) or `503` with `recorded: true` (stored in the admin console).
- **Admin console:** open `https://<your-domain>/admin` → redirects to `/admin/login`; log in with the configured admin credentials; confirm sections render.
- **Uploads:** as admin, upload a certificate document via `/api/admin/documents` → confirm the file is served from `/documents/<uuid>.<ext>` with `Content-Disposition: attachment`.

## 12. How to troubleshoot common deployment errors

- **Build fails:** run `npm ci && npm run build` locally — fix type errors (the build output shows them). Common: missing `ADMIN_PASSWORD_HASH` is fine (admin disabled), but code must build with or without it.
- **Start fails ("production build not found"):** ensure the build step completed before start (Render runs build first; if you changed the repo, re-run build).
- **502/500 from Render:** check Render logs — often the data dir isn't writable (set `ADALIA_DATA_DIR` to the disk path) or the build cache is stale.
- **Admin console redirects loop:** ensure `ADMIN_PASSWORD_HASH` is set and correct: regenerate with `npm run hash-admin-password -- "<password>"` and paste it. Test on `https://<your-domain>/admin/login` directly.
- **Contact form "Unable to submit":** if SMTP is misconfigured, enquiries are still stored in the admin console (`/admin/enquiries`).
- **CSS/assets 404:** ensure `NODE_ENV=production` — the app's CSP/caching headers apply in production.
- **Render restart wipes data:** add the Managed Disk (§7) and set `ADALIA_DATA_DIR` (§5/§7).
- **Slowness on first load after deploy:** `next start` needs the build; confirm status "Live".

## 13. Backup and restore

- **Backup:** on Render → Service → Managed Disk → (periodic) snapshot; alternatively `rsync` the disk mount locally.
- **Restore:** copy the files back to the disk (`settings.json`, `admin-sessions.json`, `documents/*`).

## 14. Local vs production data parity

- The app reads `ADALIA_DATA_DIR` at startup. If unset, it uses `<app>/data` (cwd-relative).
- On Render without a disk, `data/` is ephemeral — deploy the Managed Disk (§7) or export `data/settings.json` before any production changes.

## 15. render.yaml (optional — if you want declarative configuration)

The repo contains `render.yaml` (read-only; not used unless you import it). For manual setup, follow this guide's §3–§8 (manual configuration is simpler for a one-time launch; `render.yaml` requires a clean repo state and future maintenance).

## 16. Going live checklist

1. [ ] `npm ci && npm run build` locally — build passes.
2. [ ] Create Web Service on Render from the repo + `main` branch.
3. [ ] Add Managed Disk (§7).
4. [ ] Set all variables in §5 (at minimum: `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`).
5. [ ] Connect domain(s) (§8).
6. [ ] Trigger deploy; verify status "Live" + `/health` (§11).
7. [ ] Register the custom domain, verify DNS.
8. [ ] Log into admin console; confirm data (company, services, compliance) — **contact + CAC registration number to be verified by ADALIA OIL AND GAS LTD** (see `LAUNCH_READINESS_REPORT.md`).
9. [ ] Test contact form + supplier registration from the public site (§11).
