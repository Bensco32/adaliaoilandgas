/**
 * Public supplier registration API.
 *
 * - Multipart form with supporting document files.
 * - Honeypot anti-spam field; rate limit per client IP (3 submissions / 15 min).
 * - Origin check when present; input validation; size/extension allowlists.
 * - Stores registrations in the admin-editable settings store with status
 *   "pending"; admin can approve or reject via /admin/suppliers.
 * - Explicitly never claims the registration is approved.
 */
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/csrf";
import { clientIp, isRateLimited, resetRateLimit } from "@/lib/rateLimiter";
import { isDocumentAllowed } from "@/lib/fileTypes";
import { storeUpload } from "@/lib/secureUpload";
import { mutateSettings, newId, nowIso } from "@/lib/settings";
import type { SupplierRegistration } from "@/lib/settings";

const MAX_FIELDS_LEN = {
  companyName: 200,
  contactPerson: 200,
  email: 200,
  phone: 100,
  address: 400,
  servicesDescription: 3000,
  cacRegistration: 200
} as const;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function parseStringField(form: FormData, name: string, max: number): string {
  return clean(form.get(name), max);
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const ip = clientIp(req);
  const rate = isRateLimited(`supplier:${ip}`, 3, 15 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many submission attempts. Please try again later." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  // Honeypot: any value in the hidden field is treated as bot activity.
  const honeypot = clean(form.get("website_alt"), 50);
  if (honeypot) {
    return NextResponse.json({ error: "Submission blocked." }, { status: 400 });
  }

  const companyName = parseStringField(form, "companyName", MAX_FIELDS_LEN.companyName);
  const contactPerson = parseStringField(form, "contactPerson", MAX_FIELDS_LEN.contactPerson);
  const email = parseStringField(form, "email", MAX_FIELDS_LEN.email);
  const phone = parseStringField(form, "phone", MAX_FIELDS_LEN.phone);
  const address = parseStringField(form, "address", MAX_FIELDS_LEN.address);
  const servicesDescription = parseStringField(form, "servicesDescription", MAX_FIELDS_LEN.servicesDescription);
  const cacRegistration = parseStringField(form, "cacRegistration", MAX_FIELDS_LEN.cacRegistration);

  if (!companyName || companyName.length < 2) return NextResponse.json({ error: "Please enter a company name." }, { status: 400 });
  if (!contactPerson) return NextResponse.json({ error: "Please enter a contact person's name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!address) return NextResponse.json({ error: "Please enter a business address." }, { status: 400 });
  if (servicesDescription.length < 10) return NextResponse.json({ error: "Please describe the services or products supplied." }, { status: 400 });

  // Collect supporting documents.
  const documentFields = [...form.getAll("documents")].filter((v): v is File => v instanceof File);
  const documents: SupplierRegistration["documents"] = [];
  for (const file of documentFields.slice(0, 10)) {
    const check = isDocumentAllowed(file.name, file.size);
    if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });
    const uploaded = await storeUpload(file);
    documents.push({
      name: uploaded.originalName,
      path: uploaded.path,
      uploadedAt: nowIso()
    });
  }

  const registration: SupplierRegistration = {
    id: newId("supplier"),
    companyName,
    contactPerson,
    email,
    phone: phone || "(none provided)",
    address,
    servicesDescription,
    cacRegistration,
    documents,
    status: "pending",
    reviewedAt: null,
    note: "Registered on the supplier portal. Registration does not guarantee approval or contract awards.",
    submittedAt: nowIso()
  };

  mutateSettings((settings) => {
    settings.supplierRegistrations.unshift(registration);
    settings.activity.unshift({ id: newId("act"), at: nowIso(), action: "public_supplier_registration", detail: `Received application from ${companyName}.` });
    settings.activity = settings.activity.slice(0, 200);
  });

  resetRateLimit(`supplier:${ip}`);

  return NextResponse.json({
    ok: true,
    message:
      "Thank you for applying to become an Adalia Oil and Gas Ltd supplier or contractor. Your application is under review; we will contact you at the email you provided."
  });
}
