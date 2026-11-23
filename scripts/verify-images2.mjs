import fs from "node:fs";
(async () => {
  const t = await fetch("http://localhost:3000/").then((r) => r.text());
  const srcs = [...new Set([...t.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&")))];
  console.log("srcs:", srcs.length);
  const disk = fs.readdirSync("public/images");
  console.log("disk files:", disk.length);
  for (const src of srcs) {
    const name = src.replace("/images/", "");
    const onDisk = disk.includes(name);
    const url = `http://localhost:3000${src}`;
    let status = "n/a";
    try {
      const r = await fetch(url);
      status = String(r.status);
    } catch (e) {
      status = "ERR " + e.message;
    }
    if (!onDisk || status !== "200") {
      console.log(`src="${src}" onDisk=${onDisk} status=${status}`);
      if (!onDisk) {
        const close = disk.filter((d) => d.toLowerCase().includes(name.slice(0, 20).toLowerCase()));
        console.log("   close matches:", close);
      }
    }
  }
  console.log("done");
})();
