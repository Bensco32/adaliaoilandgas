import fs from "fs";
const s = JSON.parse(fs.readFileSync("data/settings.json", "utf8"));
console.log("company.objectives:", JSON.stringify(s.company.objectives));
(async () => {
  const t = await fetch("http://127.0.0.1:3100/contact").then((r) => r.text());
  console.log("has canonical:", t.includes('rel="canonical"'));
  console.log("has og:title:", t.includes("og:title"));
  const i = t.indexOf("og:title");
  console.log("og snippet:", t.slice(Math.max(0, i - 80), i + 100).replace(/\n/g, " "));
  const j = t.indexOf("rel=\"canonical\"");
  console.log("canonical snippet:", t.slice(Math.max(0, j - 80), j + 100).replace(/\n/g, " "));
})();
