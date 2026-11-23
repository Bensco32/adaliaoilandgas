const BASE = "http://localhost:3000";
(async () => {
  const t = await fetch(BASE + "/").then((r) => r.text());
  // Find the About Us dropdown panel (the w-56 one after the About Us button)
  const aboutButton = t.indexOf("About Us <svg");
  const panelStart = t.indexOf('<div class="invisible absolute left-0 top-full mt-2 w-56', aboutButton);
  const panelEnd = t.indexOf("</div></div>", panelStart);
  const panel = t.slice(panelStart, panelEnd + 12);
  console.log("About Us dropdown items:");
  console.log([...panel.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((m) => "• " + m[1].trim()).join("\n"));
  // Verify "Projects", "Contact Us", "Governance" present in the dropdown
  for (const item of ["/about", "/projects", "/contact", "/governance"]) {
    console.log(`  has link to ${item}:`, panel.includes(`href="${item}"`));
  }
})();
