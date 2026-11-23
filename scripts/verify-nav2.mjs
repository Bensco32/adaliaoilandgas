const BASE = "http://localhost:3000";
(async () => {
  const t = await fetch(BASE + "/").then((r) => r.text());
  const navMatch = t.match(/<nav[^>]*lg:flex[^>]*>([\s\S]*?)<\/nav>/);
  const nav = navMatch ? navMatch[1] : "";
  // Remove all hover-dropdown panels, keep only top-level items
  const topLevel = nav.replace(/<div class="invisible[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g, " [dropdown] ");
  const topItems = [...topLevel.matchAll(/<(a|button)[^>]*>\s*([\s\S]*?)<\/(a|button)>/g)]
    .map((m) => ({ tag: m[1], text: m[2].replace(/<svg[\s\S]*?<\/svg>/g, "").trim() }));
  console.log("=== TOP-LEVEL nav items (desktop) ===");
  console.log(topItems.map((i) => `${i.tag.toUpperCase()}: ${i.text}`).join("\n"));
  // Extract About Us dropdown
  const aboutPanel = nav.match(/<button[^>]*>\s*About Us[^<]*<svg[^>]*><\/svg>\s*<\/button>\s*(<div class="invisible[\s\S]*?<\/div>\s*<\/div>)/);
  console.log("=== About Us dropdown items ===");
  if (aboutPanel) {
    console.log([...aboutPanel[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((m) => "• " + m[1].trim()).join("\n"));
  } else {
    console.log("About Us dropdown NOT FOUND");
  }
  const divisionsPanel = nav.match(/<button[^>]*>\s*Our Divisions[^<]*<svg[^>]*><\/svg>\s*<\/button>\s*(<div class="invisible[\s\S]*?<\/div>\s*<\/div>)/);
  console.log("=== Our Divisions dropdown item count:", divisionsPanel ? [...divisionsPanel[1].matchAll(/<a[^>]*>/g)].length : 0);
})();
