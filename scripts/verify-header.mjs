const BASE = "http://localhost:3000";
(async () => {
  try {
    const r = await fetch(BASE + "/");
    const t = await r.text();
    console.log("status:", r.status);
    const m = t.match(/<header[^>]*class="([^"]*)"/);
    console.log("header class:", m ? m[1] : "NOT FOUND");
    console.log("has bg-transparent anywhere in header:", t.includes("bg-transparent"));
    const hasNavy = t.includes('class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-navy-900"');
    console.log("header has opaque bg-navy-900:", hasNavy);
  } catch (e) {
    console.log("ERR", e.message);
  }
})();
