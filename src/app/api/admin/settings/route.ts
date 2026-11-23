/**
 * Admin settings API.
 *
 * - `GET` returns the full editable settings store.
 * - `PUT { section, data }` replaces a section after per-section validation.
 * - `DELETE ?section=enquiries&id=<id>` removes an enquiry or certificate.
 * - `POST ?action=mark_read` toggles enquiry read state.
 *
 * Auth: session cookie (see `/api/admin/auth`), CSRF: origin check.
 */
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/csrf";
import { clientIp, isRateLimited } from "@/lib/rateLimiter";
import { loadSettings, logActivity, mutateSettings, type CompanyProfile, type ComplianceCertificate, type Settings } from "@/lib/settings";
import type {
  GovernanceDocument,
  HsePolicyDocument,
  ManagementMember,
  ProjectRecord,
  ServiceRecord,
  SupplierRegistration
} from "@/lib/settings";
import { requireSession } from "@/lib/adminAuth";

const SECTIONS = ["company", "services", "projects", "compliance", "hsePolicies", "governanceDocs", "suppliers", "enquiries"] as const;
type Section = (typeof SECTIONS)[number];

const MAX_ITEMS = 500;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function str(v: unknown, max = 4000, required = false): string {
  if (typeof v !== "string") return required ? "" : "";
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function bool(v: unknown): boolean {
  return v === true || v === 1 || v === "true";
}

function stringsList(v: unknown, maxItems = 20): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v.slice(0, maxItems)) {
    const s = str(item, 500).trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

function sanitizeCompany(raw: unknown, current: CompanyProfile): Partial<CompanyProfile> {
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as Record<string, unknown>;
  // Merge semantics: fields the client did not send keep their current values.
  const text = <K extends keyof CompanyProfile>(key: K, max: number): string =>
    r[key] === undefined ? (current[key] as string) : str(r[key], max);
  const textArray = (key: string, maxItems: number, maxLen: number): string[] =>
    r[key] === undefined
      ? [...(((current as unknown as Record<string, unknown>)[key] as string[] | undefined) ?? [])]
      : stringsList(r[key], maxItems).map((s) => str(s, maxLen)).filter(Boolean);
  const flag = (key: "addressRequiresVerification" | "phoneRequiresVerification" | "emailRequiresVerification" | "rcNumberRequiresVerification", value: unknown, currentValue: boolean): boolean =>
    value === undefined ? currentValue : value !== false;
  const management = r.management === undefined
    ? [...current.management]
    : Array.isArray(r.management)
        ? r.management
            .slice(0, 20)
            .map((m): ManagementMember => {
              if (typeof m !== "object" || m === null) {
                return { name: "", title: "", bio: "", verified: false };
              }
              const mm = m as Record<string, unknown>;
              return {
                name: str(mm.name, 200, true),
                title: str(mm.title, 200),
                bio: str(mm.bio, 1000),
                linkedin: str(mm.linkedin, 300) || undefined,
                verified: bool(mm.verified)
              };
            })
            .filter((m) => m.name)
        : [];
  // Never mark an unconfirmed contact field as verified server-side.
  const contact = {
    addressRequiresVerification: flag("addressRequiresVerification", r.addressRequiresVerification, current.addressRequiresVerification),
    phoneRequiresVerification: flag("phoneRequiresVerification", r.phoneRequiresVerification, current.phoneRequiresVerification),
    emailRequiresVerification: flag("emailRequiresVerification", r.emailRequiresVerification, current.emailRequiresVerification),
    rcNumberRequiresVerification: flag("rcNumberRequiresVerification", r.rcNumberRequiresVerification, current.rcNumberRequiresVerification)
  };
  const verified = {
    addressVerified: bool(r.addressVerified) && contact.addressRequiresVerification === false,
    phoneVerified: bool(r.phoneVerified) && contact.phoneRequiresVerification === false,
    emailVerified: bool(r.emailVerified) && contact.emailRequiresVerification === false,
    rcNumberVerified: bool(r.rcNumberVerified) && contact.rcNumberRequiresVerification === false
  };
  const social = (typeof r.social === "object" && r.social !== null ? (r.social as Record<string, unknown>) : {}) as Record<string, unknown>;
  const socialField = (key: "whatsapp" | "instagram" | "facebook"): string =>
    social[key] === undefined ? current.social[key] : str(social[key], 300);
  return {
    name: r.name === undefined ? current.name : str(r.name, 120, true) || "ADALIA OIL AND GAS LTD",
    slogan: text("slogan", 120),
    foundation: text("foundation", 400),
    website: text("website", 200),
    address: text("address", 300),
    phone: text("phone", 100),
    email: text("email", 200),
    rcNumber: text("rcNumber", 100),
    ...contact,
    ...verified,
    about: text("about", 8000),
    about2: text("about2", 4000),
    aboutLong: textArray("aboutLong", 10, 2000),
    vision: text("vision", 1500),
    mission: text("mission", 1500),
    hse: text("hse", 1500),
    objectives: textArray("objectives", 10, 500),
    management,
    social: {
      whatsapp: socialField("whatsapp"),
      instagram: socialField("instagram"),
      facebook: socialField("facebook")
    }
  };
}

function sanitizeServices(raw: unknown): ServiceRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((item, i): ServiceRecord => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      id: str(r.id, 60, true) || `svc-${i + 1}`,
      title: str(r.title, 200, true),
      division: str(r.division, 100, true),
      description: str(r.description, 2000),
      objectives: stringsList(r.objectives, 8).map((s) => str(s, 500)).filter(Boolean),
      capabilities: stringsList(r.capabilities, 8).map((s) => str(s, 500)).filter(Boolean),
      image: str(r.image, 300),
      verified: bool(r.verified)
    };
  }).filter((s) => s.title);
}

function sanitizeProjects(raw: unknown): ProjectRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((item, i): ProjectRecord => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      id: str(r.id, 60, true) || `proj-${i + 1}`,
      title: str(r.title, 200, true),
      location: str(r.location, 300),
      description: str(r.description, 5000),
      client: str(r.client, 300),
      partner: str(r.partner, 300),
      completionDate: str(r.completionDate, 100) || null,
      status: str(r.status, 100, true) || "Not specified",
      images: stringsList(r.images, 10).map((s) => str(s, 300)).filter(Boolean),
      verified: bool(r.verified)
    };
  }).filter((p) => p.title);
}

function sanitizeCertificates(raw: unknown): ComplianceCertificate[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((item, i): ComplianceCertificate => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const validStatuses = ["issued", "application", "not_submitted", "pending_verification"];
    const status = validStatuses.includes(str(r.status, 50, true)) ? (str(r.status, 50, true) as ComplianceCertificate["status"]) : "application";
    const verified = bool(r.verified) && status === "issued";
    return {
      id: str(r.id, 60, true) || `cert-${i + 1}`,
      title: str(r.title, 200, true),
      category: str(r.category, 120, true) || "Other permit",
      authority: str(r.authority, 300),
      reference: str(r.reference, 200),
      issueDate: str(r.issueDate, 100) || null,
      expiryDate: str(r.expiryDate, 100) || null,
      status,
      verified,
      documentUrl: str(r.documentUrl || r.certificateUrl, 300),
      certificateId: str(r.certificateId, 200),
      note: str(r.note, 2000)
    };
  }).filter((c) => c.title);
}

function sanitizePolicyDocs<T extends HsePolicyDocument | GovernanceDocument>(raw: unknown): T[] {
  if (!Array.isArray(raw)) return [];
  const validStatuses = ["draft", "approved", "published"];
  return raw.slice(0, MAX_ITEMS).map((item, i) => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      id: str(r.id, 60, true) || `doc-${i + 1}`,
      title: str(r.title, 200, true),
      category: str(r.category, 120, true) || "Policy",
      version: str(r.version, 20, true) || "1.0",
      effectiveDate: str(r.effectiveDate, 100) || null,
      status: validStatuses.includes(str(r.status, 20, true)) ? (str(r.status, 20, true) as HsePolicyStatusLike) : "draft",
      verified: bool(r.verified),
      documentUrl: str(r.documentUrl, 300),
      content: str(r.content, 20000)
    } as T;
  }).filter((d) => d.title);
}

type HsePolicyStatusLike = HsePolicyDocument["status"];

function sanitizeSuppliers(raw: unknown): SupplierRegistration[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((item, i): SupplierRegistration => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    return {
      id: str(r.id, 60, true) || `sup-${i + 1}`,
      companyName: str(r.companyName, 200, true),
      contactPerson: str(r.contactPerson, 200),
      email: str(r.email, 200),
      phone: str(r.phone, 100),
      address: str(r.address, 400),
      servicesDescription: str(r.servicesDescription, 3000),
      cacRegistration: str(r.cacRegistration, 200),
      documents: Array.isArray(r.documents) ? r.documents.slice(0, 20).map((d) => {
        const dd = (typeof d === "object" && d !== null ? d : {}) as Record<string, unknown>;
        return { name: str(dd.name, 200, true), path: str(dd.path, 300, true), uploadedAt: str(dd.uploadedAt, 100) || new Date().toISOString() };
      }).filter((d) => d.name && d.path) : [],
      status: ["pending", "approved", "rejected"].includes(str(r.status, 20, true)) ? (str(r.status, 20, true) as SupplierRegistration["status"]) : "pending",
      reviewedAt: str(r.reviewedAt, 100) || null,
      note: str(r.note, 1500),
      submittedAt: str(r.submittedAt, 100) || new Date().toISOString()
    };
  }).filter((s) => s.companyName);
}

function sanitizeEnquiries(raw: unknown): Settings["enquiries"] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_ITEMS).map((item): Settings["enquiries"][number] => {
    const r = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const delivery = (typeof r.delivery === "object" && r.delivery !== null ? r.delivery : {}) as {
      email?: unknown;
      whatsapp?: unknown;
      details?: Record<string, string>;
    };
    return {
      id: str(r.id, 60, true) || new Date().toISOString(),
      fullName: str(r.fullName, 120, true),
      email: str(r.email, 200, true),
      companyName: str(r.companyName, 200),
      phone: str(r.phone, 60),
      country: str(r.country, 100),
      division: str(r.division, 200, true),
      subject: str(r.subject, 300, true),
      message: str(r.message, 20000),
      receivedAt: str(r.receivedAt, 100) || new Date().toISOString(),
      delivery: {
        email: str(delivery.email, 20, true),
        whatsapp: str(delivery.whatsapp, 20, true),
        details: delivery.details ?? {}
      },
      read: bool(r.read)
    };
  });
}

export async function GET(req: Request) {
  if (!requireSession(req)) return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });
  const settings = loadSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!requireSession(req)) return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });
  const rate = isRateLimited(clientIp(req), 20, 10_000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const bodyText = (await req.text().catch(() => "")) || "";
  if (bodyText.length > MAX_BODY_BYTES) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let body: { section?: unknown; data?: unknown };
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const section = str(body.section, 40, true) as Section;
  if (!SECTIONS.includes(section)) return NextResponse.json({ error: "Invalid section." }, { status: 400 });

  mutateSettings((settings) => {
    switch (section) {
      case "company": {
        const sanitized = sanitizeCompany(body.data, settings.company);
        Object.assign(settings.company, sanitized);
        break;
      }
      case "services":
        settings.services = sanitizeServices(body.data);
        break;
      case "projects":
        settings.projects = sanitizeProjects(body.data);
        break;
      case "compliance":
        settings.compliance = sanitizeCertificates(body.data);
        break;
      case "hsePolicies":
        settings.hsePolicies = sanitizePolicyDocs<HsePolicyDocument>(body.data);
        break;
      case "governanceDocs":
        settings.governanceDocs = sanitizePolicyDocs<GovernanceDocument>(body.data);
        break;
      case "suppliers":
        settings.supplierRegistrations = sanitizeSuppliers(body.data);
        break;
      case "enquiries":
        settings.enquiries = sanitizeEnquiries(body.data);
        break;
    }
  });

  logActivity("admin_settings_updated", `Admin updated: ${section}`);
  const settings = loadSettings();
  return NextResponse.json({ ok: true, section, settings });
}

export async function DELETE(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!requireSession(req)) return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });
  const section = req.url.match(/section=([a-zA-Z]+)/)?.[1] || "";
  const id = req.url.match(/id=([a-zA-Z0-9-]+)/)?.[1] || "";
  if (!["enquiries", "compliance"].includes(section) || !id) {
    return NextResponse.json({ error: "Invalid section or id." }, { status: 400 });
  }
  mutateSettings((settings) => {
    if (section === "enquiries") {
      settings.enquiries = settings.enquiries.filter((e) => e.id !== id);
    } else {
      settings.compliance = settings.compliance.filter((c) => c.id !== id);
    }
  });
  logActivity("admin_delete", `Admin deleted ${section} entry ${id}`);
  return NextResponse.json({ ok: true, deletedId: id });
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!requireSession(req)) return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });
  const action = req.url.match(/action=([a-zA-Z_]+)/)?.[1];
  if (action === "mark_read") {
    const section = req.url.match(/section=([a-zA-Z]+)/)?.[1] || "";
    const id = req.url.match(/id=([a-zA-Z0-9-]+)/)?.[1] || "";
    if (section !== "enquiries" || !id) return NextResponse.json({ error: "Invalid section or id." }, { status: 400 });
    mutateSettings((settings) => {
      settings.enquiries = settings.enquiries.map((e) => (e.id === id ? { ...e, read: !e.read } : e));
    });
    logActivity("admin_mark_read", `Admin toggled read state of enquiry ${id}`);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
