(async () => {
  const t = await fetch("http://localhost:3000/").then((r) => r.text());
  const i = t.indexOf('<main id="main"');
  console.log("main snippet:", t.slice(i, i + 80).replace(/\n/g, " "));
})();
