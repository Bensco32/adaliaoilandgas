/**
 * Contact enquiry API.
 *
 * Repairs and hardening:
 * - Origin check (CSRF) when Origin header is present.
 * - Rate limit per client IP (10 enquiries / 10 min).
 * - Honeypot field ("website") — silent acceptance.
 * - Full validation with length limits and control-character stripping.
 * - Enquiries are persisted (admin-visible at /admin/enquiries) so nothing is
 *   lost.
 * - Only true delivery states (email sent / activation queued / whatsapp sent
 *   / not configured) are returned; the UI never claims delivery it didn't
 *   achieve.
 * - Errors are generic; details are logged server-side.
 */
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/csrf";
import { clientIp, isRateLimited } from "@/lib/rateLimiter";
import { enquiryMessage, whatsappUrl } from "@/lib/contact-config";
import { deliverEnquiry } from "@/lib/notifications";
import { mutateSettings, newId, nowIso, type EnquiryRecord } from "@/lib/settings";

const MAX_BODY_BYTES = 20_000;

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

function recordEnquiry(record: EnquiryRecord): void {
  mutateSettings((settings) => {
    settings.enquiries.unshift(record);
    settings.enquiries = settings.enquiries.slice(0, 500);
    settings.activity.unshift({
      id: newId("act"),
      at: nowIso(),
      action: "public_contact_enquiry",
      detail: `Enquiry from ${record.fullName}: ${record.subject}`
    });
    settings.activity = settings.activity.slice(0, 200);
  });
}

export async function POST(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (req.headers.get("content-length") && Number.parseInt(req.headers.get("content-length") || "0", 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  const ip = clientIp(req);
  if (isRateLimited(`contact:${ip}`, 10, 10 * 60_000).allowed === false) {
    return NextResponse.json({ error: "Please wait a moment before sending another enquiry." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    // Honeypot: silent acceptance.
    if (clean(body.website, 50)) return NextResponse.json({ ok: true, spamBlocked: true });

    const data = {
      fullName: clean(body.fullName, 120),
      email: clean(body.email, 200),
      companyName: clean(body.companyName, 200),
      phone: clean(body.phone, 60),
      country: clean(body.country, 100),
      division: clean(body.division, 200),
      subject: clean(body.subject, 200),
      message: clean(body.message, 5000)
    };

    if (!data.fullName || !data.email || !data.division || !data.subject || !data.message) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const text = enquiryMessage(data);
    const chatUrl = whatsappUrl(`Hello Adalia, I sent an enquiry via the website:\n\n${text}`);

    const record: EnquiryRecord = {
      id: newId("enq"),
      ...data,
      receivedAt: nowIso(),
      delivery: { email: "pending", whatsapp: "pending", details: {} },
      read: false
    };

    const delivery = await deliverEnquiry({ ...data, body: text, whatsappUrl: chatUrl });
    record.delivery = {
      email: delivery.email,
      whatsapp: delivery.whatsapp,
      details: delivery.details
    };

    if (delivery.email === "sent") record.delivery.details.email = "Delivery succeeded via SMTP.";
    if (delivery.whatsapp === "sent") record.delivery.details.whatsapp = "Delivered via WhatsApp.";

    recordEnquiry(record);

    const ok = delivery.email === "sent" || delivery.whatsapp === "sent" || delivery.email === "activation_required";
    if (!ok) {
      console.error("[Contact enquiry] delivery incomplete", {
        fullName: data.fullName,
        email: data.email,
        division: data.division,
        emailState: delivery.email,
        whatsappState: delivery.whatsapp
      });
    }

    if (!ok) {
      return NextResponse.json(
        {
          error: "We could not deliver your enquiry right now. Please try again in a few minutes or contact us directly.",
          recorded: true
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, delivery, recorded: true });
  } catch (error) {
    console.error("[Contact enquiry] failed", error);
    return NextResponse.json({ error: "Unable to submit your enquiry at this time." }, { status: 500 });
  }
}
