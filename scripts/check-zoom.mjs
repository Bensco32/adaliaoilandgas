const t = await fetch("http://localhost:3000/").then((r) => r.text());
const i = t.indexOf('class="absolute inset-0"');
const around = t.slice(Math.max(0, i - 400), i + 300);
const m = around.match(/style="([^"]*)"/);
console.log("slide style:", m ? m[1] : "none");
console.log("has new zoom code scale(1.1):", t.includes("scale(1.1)"));
console.log("has old zoom scale(1.06):", t.includes("scale(1.06)"));
