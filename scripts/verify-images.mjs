(async () => {
  const t = await fetch("http://localhost:3000/").then((r) => r.text());
  const srcs = [...new Set([...t.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]))];
  console.log("unique img srcs in /:", srcs.length);
  const broken = [];
  for (const src of srcs) {
    const url = src.startsWith("http") ? src : `http://localhost:3000${src}`;
    try {
      const r = await fetch(url);
      const ok = r.status === 200 && (r.headers.get("content-type") || "").includes("image");
      console.log(`  ${r.status} ${src.slice(0, 90)}${ok ? "" : " <-- BROKEN"}`);
      if (!ok) broken.push(src);
    } catch (e) {
      console.log(`  ERR ${src}`);
      broken.push(src);
    }
  }
  console.log("broken:", broken.length);
  const hero = t.includes("POWERING THE FUTURE");
  console.log("hero text:", hero);
})();
