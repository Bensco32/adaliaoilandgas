(async () => {
  const about = await fetch("http://localhost:3000/about").then((r) => r.text());
  console.log("/about has about text:", about.includes("full-capacity indigenous energy group"));
  console.log("/about has management section:", about.includes("MANAGEMENT"));
  console.log("/about has objectives:", about.includes("CORPORATE OBJECTIVES"));
  const c = await fetch("http://localhost:3000/contact").then((r) => r.text());
  console.log("/contact has phone line:", c.includes("Phone"));
  console.log("/contact has test phone:", c.includes("+234-1-234-5678"));
})();
