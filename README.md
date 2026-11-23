# ADALIA OIL AND GAS LTD — Corporate Website

Production-quality corporate website for **ADALIA OIL AND GAS LTD** (Driven by Excellence. Powering Energy.), built with Next.js, TypeScript, Tailwind CSS and Framer Motion.

## Tech stack

- **Next.js (App Router)** + **TypeScript**
- **React 19**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- API routes for contact submissions, supplier registration and the AI chatbot
- **Admin console** (session-based authentication) for managing all website content

## Project structure

- `src/app` — routes, layout, metadata, API routes, sitemap/robots
- `src/components` — reusable UI and page sections (Hero slider, Navbar, Footer, Chatbot, etc.)
- `src/data/company.ts` — initial company content (admin-editable versions live in the admin store)
- `src/lib/settings.ts` — the admin-editable settings store (`data/settings.json`)
- `src/lib/adminAuth.ts` — admin session management
- `src/lib/secureUpload.ts` — secure file uploads for documents (`data/documents/`)
- `src/lib/site.ts` — site URL helper
- `data/` — runtime data: `settings.json` (company profile, services, projects, compliance, HSE policies, governance docs, supplier applications, enquiries, activity log), `admin-sessions.json` (admin console sessions), `documents/` (uploaded certificates/policies)
- `scripts/smoke-test.mjs` — production smoke tests (`node scripts\smoke-test.mjs`)
- `scripts/admin-test.mjs` — admin console flow tests (`node scripts\admin-test.mjs`)
- `public/images` — all site images and the company logo (`Company Logo.png`)
- `.env.example` — required/optional environment variables
- `LAUNCH_READINESS_REPORT.md` — launch readiness assessment

## Getting started

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm

### Install
```bash
npm install
```

### Configure environment
Copy `.env.example` to `.env.local` and set values as needed:

```bash
cp .env.example .env.local
```

Generate a password hash for the admin console:

```bash
npm run hash-admin-password -- "YourAdminPassword123"
```

Set the result as `ADMIN_PASSWORD_HASH` in `.env.local`. See `.env.example` for the full list of environment variables.

**Security note:** Never commit `.env.local`. The `.env*` files are excluded from Git; admin sessions, enquiries, supplier applications and uploaded documents are stored under `data/` which is excluded from Git (except `data/settings.json`, the editable content store).

### Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Production build
```bash
npm run build
npm start
```

## Public website

- **Home** — cinematic hero slider, about, divisions, why choose, HSE, values, gallery, FAQ, contact
- **About Us** — company profile, vision, mission, management & leadership, corporate objectives
- **Services** — all services by division with objectives and enquiry buttons
- **Divisions** — detailed pages for Drilling Services, Crude Lifting & Marine Logistics, Adalia Gas and Petroleum Supply
- **HSE** — Health & Safety policy overview + verified, published HSE policies with downloadable documents
- **Compliance & Certifications** — verified & issued certificates with authority, reference, issue/expiry dates and downloadable documents; regulatory notes by activity
- **Corporate Governance** — code of conduct, anti-bribery, conflict of interest, endorsing procedures, supplier/contractor conduct, corporate responsibility
- **Projects & Experience** — verified projects
- **Suppliers** — company supplier registration portal (validated, rate-limited, honeypot, file uploads)
- **Contact** — contact details, enquiry form (validated, CSRF-protected, persisted), social links
- **FAQs**, **Privacy Policy**, **Terms of Use**, **Cookie Policy** — public legal/information pages
- **Legal notices** — company name is consistently displayed as **ADALIA OIL AND GAS LTD**
- **SEO** — page titles, meta descriptions, canonical URLs, Open Graph, Twitter cards, XML sitemap (`/sitemap.xml`), robots.txt, structured data (Organization, WebSite, FAQ, FAQPage, Service), favicon
- **Privacy & accessibility** — HttpOnly, SameSite=Strict, Secure admin cookie; cookie consent banner (accept-all/manage preferences); accessible forms with ARIA labels and error messages
- **Admin console login URL** — `/admin/login`

## Admin console (`/admin`)

A session-based admin console for managing all website content. Access it at `/admin` (login via `/admin/login`). It manages:

- **Company Profile** — name, slogan, foundation, mission, vision, objectives, management & leadership, values, about text, social links, and verified contact details (address, phone, email, CAC registration number). Unverified fields are marked for verification and hidden from public pages.
- **Services** — title, description, division, objectives, operational capabilities, image, and verified status.
- **Projects & Experience** — project titles, locations, descriptions, statuses, photos (upload), and verification flags.
- **Compliance & Certifications** — certificate titles, issuing authority, reference numbers, issue/expiry dates, status (`issued`/`application`/`not_submitted`/`pending_verification`), and upload of certificate documents. Expiry warnings surface on the dashboard.
- **HSE Policies** — policy titles, categories, versions, effective dates, status, and downloadable policy documents.
- **Corporate Governance** — code of conduct, anti-bribery, conflict of interest, endorsing,business ethics, liberating, and supplier/contractor compliance documentation.
- **Suppliers** — review supplier registration applications (approve/reject, attach notes, view documents).
- **Enquiries** — view contact form submissions, mark read/unread, delete.
- **Knowledge Base** (existing) — semantic search and embedding management for the ADALIA AI Assistant.
- **Dashboard** — counts of unread enquiries, pending suppliers, verified certificates, expiring certificates (within 90 days), recent activity log.

## AI Assistant & Company Knowledge Base

The existing assistant (`src/components/Chatbot.tsx`) works with retrieval from the verified company knowledge base in `src/lib/knowledge/company-knowledge.ts`. See the README notes below for testing.

## Testing

### Smoke tests (public website)
```bash
node scripts\smoke-test.mjs
```
Checks all public pages load, no placeholders appear publicly, security headers are present, the contact form validates, the supplier form validates, and the admin redirect works when unauthenticated.

### Admin console flow tests
```bash
node scripts\admin-test.mjs
```
Checks the admin login flow (cookie attributes, redirection when unauthenticated), settings GET/PUT round-trips, admin page visibility, settings reflection on the public contact page, document upload, traversal protection, and logout.

### Dependency security
```bash
npm audit
```
Known-issue summary: `npm audit fix` applied to reduce the moderate-severity minimatch issues. The high-severity `postcss` advisory (XSS via unescaped `</style>`) requires a major upgrade (`npm audit fix --force` → `next@16`), which was not applied. See `LAUNCH_READINESS_REPORT.md`.

## Storage notes (important)

- `data/settings.json` — committed; editable company profile, services, projects, compliance certificates, HSE policies, governance documents, supplier registrations, enquiries, and activity log.
- `data/documents/` — uploaded documents (certificates, HSE/governance PDFs, project photos), generated server-side.
- `data/admin-sessions.json` — admin console sessions.

**Deployment note:** This app uses file-based storage for its data. On platforms with ephemeral disks (e.g., Render), deploy with `data/settings.json` included in the repo and a writable `data/` directory, or export the runtime files (documents, sessions) to persistent storage after enabling admin edits. See `LAUNCH_READINESS_REPORT.md`.

## AI Assistant & Company Knowledge Base (existing features)

The assistant (`src/components/Chatbot.tsx`) retrieves from the verified company knowledge base in `src/lib/knowledge/company-knowledge.ts` via `src/lib/knowledge/retrieval.ts`. Records are generated from `src/data/company.ts` and the published pages, and never present company facts as verified beyond the source text. Testing: `node scripts/test-assistant.mjs` and `node scripts/test-answer-quality.mjs`.

## Configuration (`env`)

| Variable | Required | Description |
|---|---|---|
| `ADMIN_USERNAME` | No | Admin console username (default: `admin`). |
| `ADMIN_PASSWORD_HASH` | Yes (admin only) | scrypt hash for the admin console — generate with `npm run hash-admin-password -- "<password>"`. When unset, the admin console is disabled. |
| `ADALIA_ADMIN_SESSION_TTL_MS` | No | Admin session lifetime (default: `1800000` = 30 min). |
| `ADALIA_FORCE_COOKIE_SECURE` | No | Force `Secure` on the admin cookie when not behind HTTPS (harmless locally). |
| `ADMIN_KNOWLEDGE_TOKEN` | No (legacy) | Deprecated — use the admin console instead. Left for backward compatibility. |
| `OPENAI_API_KEY` | No | Enables live AI responses for **ADALIA AI ASSISTANT**. If omitted, the chatbot uses the built-in knowledge fallback. |
| `OPENAI_MODEL` | No | OpenAI chat model (default: `gpt-4o-mini`). |
| `EMBEDDING_API_KEY` | No | Enables hosted transformer embeddings. |
| `EMBEDDING_MODEL` | No | Embedding model (default: `text-embedding-3-small`). |
| `CONTACT_TO_EMAIL` | No | Destination for contact notifications (relay mode). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | No | SMTP delivery for enquiries (recommended in production). |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | No | WhatsApp Cloud API delivery for enquiries. |
| `WHATSAPP_NUMBER` | No | WhatsApp fallback number (verify with ADALIA OIL AND GAS LTD). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public site URL for metadata and sitemap (default: `http://www.adaliaoilandgasltd.com`). |

See `.env.example` for the complete reference.

## Deployment

Deployable on Vercel, Netlify (Next.js runtime), or any Node.js host supporting Next.js:
1. Set environment variables in the hosting platform.
2. Ensure `data/` (or a writable equivalent) is configured for file-based storage on the platform.
3. Build with `npm run build` and run `npm start` (or use the platform Next.js adapter).
4. Ensure `NEXT_PUBLIC_SITE_URL` matches the production domain.
5. Ensure `ADMIN_PASSWORD_HASH` is set to the generated hash for the admin console.

## License

Proprietary — ADALIA OIL AND GAS LTD.
