(async () => {
  const urls = [
    "http://localhost:3000/images/Meet SLB_ The $70 billion oil services giant___ (1).jpg",
    "http://localhost:3000/images/Meet%20SLB_%20The%20%2470%20billion%20oil%20services%20giant___%20(1).jpg",
    "http://localhost:3000/images/Meet%20SLB_%20The%20$70%20billion%20oil%20services%20giant___%20(1).jpg",
    "http://localhost:3000/images/Meet SLB_ The $70 billion oil services giant___ (1).jpg?x=1"
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url);
      const ct = r.headers.get("content-type") || "";
      console.log(r.status, ct.slice(0, 40), url.slice(0, 100));
    } catch (e) {
      console.log("ERR", url.slice(0, 80));
    }
  }
  // Also try from Node with encoded $
  const enc = new URL("http://localhost:3000/images/Meet SLB_ The $70 billion oil services giant___ (1).jpg").toString();
  console.log("encoded url:", enc);
  const r2 = await fetch(enc);
  console.log("status via toString():", r2.status);
  // List the directory matching files
  const fs = await import("node:fs");
  const match = fs.readdirSync("public/images").filter((f) => f.includes("Meet SLB"));
  console.log("disk match:", match);
  // byte-compare
  for (const m of match) {
    console.log("name bytes:", [...Buffer.from(m)].slice(0, 12).join(","));
  }
})();
