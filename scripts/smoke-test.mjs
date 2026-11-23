/**
 * Production smoke tests for the ADALIA OIL AND GAS LTD website.
 * Run with: node scripts/smoke-test.mjs [base-url]
 * Exits non-zero when any check fails.
 */
const BASE = process.argv[2] || "http://localhost:3100";

const pages = [
  "/",
  "/about",
  "/services",
  "/hse",
  "/hse#hse-policies",
  "/compliance",
  "/governance",
  "/projects",
  "/suppliers",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/divisions/drilling-services",
  "/divisions/crude-lifting-marine-logistics",
  "/divisions/gas",
  "/divisions/petroleum-supply",
  "/sitemap.xml",
  "/robots.txt"
];

const PLACEHOLDERS = ["[Your Address]", "[Your Phone]", "[Your Email]", "[Your RC Number]"];

let failures = 0;
function check(name, cond, extra) {
  if (cond) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

async function get(path) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const text = await res.text();
  return { status: res.status, headers: res.headers, text };
}

async function post(path, body, headers) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: JSON.stringify(body)
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* not json */
  }
  return { status: res.status, headers: res.headers, json };
}

async function main() {
  console.log(`Smoke testing ${BASE}`);

  for (const p of pages) {
    const { status, text } = await get(p);
    check(`GET ${p} → 200`, status === 200, `got ${status}`);
    if (status === 200 && p !== "/sitemap.xml" && p !== "/robots.txt") {
      check(`GET ${p} — no public placeholders`, !PLACEHOLDERS.some((v) => text.includes(v)));
      check(`GET ${p} — no admin session token in body`, !text.includes("adalia_admin_session"));
    }
  }

  const root = await get("/");
  check("GET / — security headers (nosniff)", root.headers.get("x-content-type-options") === "nosniff");
  check("GET / — CSP header present", Boolean(root.headers.get("content-security-policy")));
  check("GET / — X-Frame-Options SAMEORIGIN", root.headers.get("x-frame-options") === "SAMEORIGIN");
  check("GET / — Strict-Transport-Security", Boolean(root.headers.get("strict-transport-security")));
  check("GET / — refers to ADALIA OIL AND GAS LTD", root.text.includes("ADALIA OIL AND GAS LTD"));

  const contact = await post("/api/contact", {});
  check("POST /api/contact (empty) → 400", contact.status === 400, `got ${contact.status}`);

  const validEnquiry = {
    fullName: "Smoke Test",
    email: "smoke@example.com",
    division: "General Business Enquiry",
    subject: "Smoke test enquiry",
    message: "This is an automated smoke test."
  };
  const contact2 = await post("/api/contact", validEnquiry);
  check("POST /api/contact (valid) → 200 or 503 with recorded", contact2.status === 200 || contact2.status === 503, `got ${contact2.status} ${JSON.stringify(contact2.json || {}).slice(0, 80)}`);

  const supplierForm = new FormData();
  supplierForm.append("companyName", "Smoke Supplier");
  supplierForm.append("contactPerson", "Smoke Person");
  supplierForm.append("email", "smoke@example.com");
  supplierForm.append("phone", "123");
  supplierForm.append("address", "1 Test Street");
  supplierForm.append("servicesDescription", "Testing services");
  const suppliers = await fetch(BASE + "/api/suppliers", { method: "POST", body: supplierForm });
  check("POST /api/suppliers (valid) → 200", suppliers.status === 200, `got ${suppliers.status}`);

  const badSupplier = await post("/api/suppliers", { companyName: "X" });
  check("POST /api/suppliers (invalid) → 400", badSupplier.status === 400, `got ${badSupplier.status}`);

  const adminLogin = await post("/api/admin/auth", { username: "admin", password: "x" });
  check("POST /api/admin/auth → 503 when unconfigured (or 401 invalid)", [401, 503].includes(adminLogin.status), `got ${adminLogin.status}`);

  const adminPage = await get("/admin");
  check("GET /admin → redirect when unauthenticated", adminPage.status === 302 || adminPage.status === 307, `got ${adminPage.status}`);

  const settings = await post("/api/admin/settings", { section: "company", data: { name: "ADALIA OIL AND GAS LTD" } });
  check("POST /api/admin/settings → 401 when unauthenticated", settings.status === 401, `got ${settings.status}`);

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Smoke test failed:", e);
  process.exit(1);
});
