const BASE = "http://localhost:3000";
(async () => {
  const t = await fetch(BASE + "/").then((r) => r.text());
  const navMatch = t.match(/<nav[^>]*lg:flex[^>]*>([\s\S]*?)<\/nav>/);
  const nav = navMatch ? navMatch[1] : "";
  console.log("=== Desktop nav link/button texts (top-level) ===");
  const items = [...nav.matchAll(/<(?:a|button)[^>]*>\s*([A-Za-z][\s\S]*?)<\/(?:a|button)>/g)].map((m) => m[1].replace(/<svg[\s\S]*?<\/svg>/g, "").trim());
  console.log(items.map((s) => "• " + s).join("\n"));
  console.log("has About Us as button:", /About Us <svg/.test(nav));
  console.log("top-level Governance present:", /<a[^>]*>[^<]*Governance<\/a>/.test(nav.replace(/<div class="invisible[^]*?<\/div>\s*<\/div>/g, "x")));
  // Extract About Us dropdown items
  const aboutDivMatch = nav.match(/<button[^>]*>\s*About Us[^<]*<svg[^>]*><\/svg>\s*<\/button>\s*(<div class="invisible[^]*?<\/div>\s*<\/div>)/);
  console.log("About Us dropdown items:", aboutDivMatch ? [...aboutDivMatch[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]).join(", ") : "NOT FOUND");
  console.log("top-level Projects link present:", /<a[^>]*>Projects<\/a>/.test(nav));
  console.log("top-level Contact Us link present:", /<a[^>]*>Contact Us<\/a>/.test(nav));
})();
