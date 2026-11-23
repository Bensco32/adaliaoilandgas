/**
 * Admin flow tests against the running production server.
 * Usage: node scripts\admin-test.mjs [base-url]
 */
const BASE = process.argv[2] || "http://localhost:3100";
const PASSWORD = process.env.ADMIN_TEST_PASSWORD || "TestAdminPass123";

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log(`PASS  ${name}`);
  else {
    failures += 1;
    console.log(`FAIL  ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

let sessionCookie = "";

async function post(path, body, headers, cookie) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers || {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, headers: res.headers, json, text };
}

async function put(path, body, cookie) {
  const res = await fetch(BASE + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, headers: res.headers, json, text };
}

async function get(path, headers, cookie) {
  const res = await fetch(BASE + path, { headers: { ...(headers || {}), ...(cookie ? { Cookie: cookie } : {}) } });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, headers: res.headers, text, json };
}

async function main() {
  // 1. Unauthenticated access denied
  const denied = await get("/api/admin/settings");
  check("GET /api/admin/settings unauthenticated → 401", denied.status === 401, `got ${denied.status}`);
  const adminPage = await fetch(BASE + "/admin", { redirect: "manual" });
  check("GET /admin unauthenticated → redirect to /admin/login", adminPage.status === 302 || adminPage.status === 307, `got ${adminPage.status}`);
  const adminLoginPage = await fetch(BASE + "/admin/login", { redirect: "manual" });
  check("GET /admin/login unauthenticated → 200 (public)", adminLoginPage.status === 200, `got ${adminLoginPage.status}`);

  // 2. Wrong password → 401
  const badLogin = await post("/api/admin/auth", { username: "admin", password: "WrongPassword1" });
  check("POST /api/admin/auth wrong password → 401", badLogin.status === 401, `got ${badLogin.status}`);

  // 3. Successful login
  const login = await post("/api/admin/auth", { username: "admin", password: PASSWORD });
  check("POST /api/admin/auth valid → 200", login.status === 200, `got ${login.status} ${login.json?.error || ""}`);
  const setCookie = login.headers.get("set-cookie") || "";
  const match = setCookie.match(/adalia_admin_session=([^;]+)/);
  sessionCookie = match ? `adalia_admin_session=${match[1]}` : "";
  check("login sets HttpOnly SameSite=Strict cookie", /adalia_admin_session=/.test(setCookie), setCookie.slice(0, 80));
  check("cookie is HttpOnly", /adalia_admin_session=[^;]+;.*HttpOnly/i.test(setCookie));
  check("cookie is SameSite=Strict", /SameSite=Strict/i.test(setCookie));
  check("cookie is Secure (NODE_ENV=production)", /Secure/i.test(setCookie), setCookie.slice(0, 160));

  const me = await post("/api/admin/auth", { action: "me" }, undefined, sessionCookie);
  void me;

  // 4. Authenticated API access
  const settingsRes = await get("/api/admin/settings", undefined, sessionCookie);
  check("GET /api/admin/settings authenticated → 200", settingsRes.status === 200, `got ${settingsRes.status}`);
  const settings = settingsRes.json?.settings;
  check("settings has company profile", Boolean(settings?.company?.name));
  check("settings has services/projects/compliance/hsePolicies/governanceDocs", [settings?.services, settings?.projects, settings?.compliance, settings?.hsePolicies, settings?.governanceDocs].every(Array.isArray));
  check("settings has enquiries and supplierRegistrations", Array.isArray(settings?.enquiries) && Array.isArray(settings?.supplierRegistrations));

  // 5. Admin page loads
  const adminPageAuth = await get("/admin", undefined, sessionCookie);
  check("GET /admin authenticated → 200", adminPageAuth.status === 200, `got ${adminPageAuth.status}`);
  check("GET /admin — admin console visible", adminPageAuth.text.includes("Admin Console"));

  // 6. PUT settings round-trip (company profile)
  const phone = `+234-1-234-5678 (${Date.now() % 100000})`;
  const putCompany = await put("/api/admin/settings", { section: "company", data: { phone, phoneRequiresVerification: false, phoneVerified: true } }, sessionCookie);
  check("PUT /api/admin/settings company → 200", putCompany.status === 200, `got ${putCompany.status} ${putCompany.json?.error || ""}`);
  const getAfter = await get("/api/admin/settings", undefined, sessionCookie);
  check("company phone updated", getAfter.json?.settings?.company?.phone === phone, getAfter.json?.settings?.company?.phone);
  check("company phone verified flag set", getAfter.json?.settings?.company?.phoneVerified === true);
  const contactPage = await get("/contact");
  check("public /contact shows updated phone", contactPage.text.includes(phone));

  // 7. Services section reflects admin data
  const putServices = await put("/api/admin/settings", { section: "services", data: settings.services }, sessionCookie);
  check("PUT /api/admin/settings services → 200", putServices.status === 200, `got ${putServices.status} ${putServices.json?.error || ""}`);

  // 8. Compliance: mark first cert verified and set a date, verify GET reflects
  const certs = settings.compliance;
  const cert = certs[0];
  const putCert = await put("/api/admin/settings", { section: "compliance", data: certs.map((c) => (c.id === cert.id ? { ...c, verified: true, status: "issued", reference: c.reference || "ADC-TEST-001" } : c)) }, sessionCookie);
  check("PUT /api/admin/settings compliance → 200", putCert.status === 200, `got ${putCert.status} ${putCert.json?.error || ""}`);
  const compliancePage = await get("/compliance");
  check("GET /compliance shows verified cert as issued", compliancePage.status === 200 && compliancePage.text.includes("Verified &amp; issued"));
  check("GET /compliance shows certificate title", compliancePage.text.includes(cert.title));

  // 9. Document upload via admin API
  const form = new FormData();
  const fakePdf = new Blob([Buffer.from("%PDF-1.4 fake test pdf")], { type: "application/pdf" });
  form.append("files", fakePdf, "test-cert.pdf");
  const uploadRes = await fetch(BASE + "/api/admin/documents", { method: "POST", body: form, headers: { Cookie: sessionCookie } });
  const uploadJson = await uploadRes.json().catch(() => ({}));
  check("POST /api/admin/documents → 200", uploadRes.status === 200, `got ${uploadRes.status} ${uploadJson.error || ""}`);
  const docPath = uploadJson.files?.[0]?.path;
  check("upload returns /documents/ path", typeof docPath === "string" && docPath.startsWith("/documents/"));
  if (docPath) {
    const served = await get(docPath);
    check("GET /documents/<slug> → 200", served.status === 200, `got ${served.status}`);
    check("document has attachment disposition", (served.headers.get("content-disposition") || "").includes("attachment"));
  }

  // 10. Traversal attempt rejected
  const traversal = await get("/documents/..%2f..%2fpackage.json");
  check("GET /documents/../package.json → 404", traversal.status === 404 || traversal.status === 400 || traversal.status === 403, `got ${traversal.status}`);

  // 11. Settings security: bad section rejected
  const badSection = await post("/api/admin/settings", { section: "hax", data: [] }, undefined, sessionCookie);
  check("PUT invalid section → 400", badSection.status === 400, `got ${badSection.status}`);

  // 12. Logout
  const logout = await post("/api/admin/auth", { action: "logout" }, undefined, sessionCookie);
  check("POST /api/admin/auth logout → 200", logout.status === 200, `got ${logout.status}`);
  const afterLogout = await get("/api/admin/settings", undefined, sessionCookie);
  check("after logout, settings → 401", afterLogout.status === 401, `got ${afterLogout.status}`);

  console.log(failures === 0 ? "\nALL ADMIN CHECKS PASSED" : `\n${failures} ADMIN CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Admin test failed:", e);
  process.exit(1);
});
