(async () => {
  const BASE = "http://localhost:3000";
  const pages = ["/", "/about", "/services", "/hse", "/compliance", "/governance", "/projects", "/suppliers", "/contact", "/faq", "/privacy", "/terms", "/cookie-policy", "/divisions/drilling-services", "/divisions/crude-lifting-marine-logistics", "/divisions/gas", "/divisions/petroleum-supply"];
  let brokenTotal = 0;
  for (const page of pages) {
    const t = await fetch(BASE + page).then((r) => r.text());
    const srcs = [...new Set([...t.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')))];
    const broken = [];
    for (const src of srcs) {
      const url = src.startsWith("http") ? src : `${BASE}${src}`;
      try {
        const r = await fetch(url);
        if (!(r.status === 200 && (r.headers.get("content-type") || "").includes("image"))) broken.push(src + " -> " + r.status);
      } catch {
        broken.push(src + " -> ERR");
      }
    }
    brokenTotal += broken.length;
    console.log(`${page.padEnd(42)} imgs=${String(srcs.length).padStart(2)} broken=${broken.length}${broken.length ? "  " + broken.join(" | ") : ""}`);
  }
  console.log("TOTAL broken:", brokenTotal);
})();
