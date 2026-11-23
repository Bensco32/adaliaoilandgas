/**
 * Answer-quality suite for the eight suggested questions, follow-ups and paraphrases.
 * Run with the site running: node scripts/test-answer-quality.mjs
 * Writes docs/answer-optimization-report.md
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const ENDPOINT = `${BASE}/api/chat`;

const checks = [
  { question: "What services does Adalia offer?", expect: [/four divisions/i, /drilling/i], forbid: [/partnership/i, /safety first/i] },
  { question: "Tell me about your drilling services.", expect: [/drilling/i, /well/i], forbid: [/lpg| CNG|LNG/i] },
  { question: "Do you offer crude oil lifting?", expect: [/^Yes\b/i, /crude/i], forbid: [/lubricants|LPG/i] },
  { question: "Do you supply LPG, CNG and LNG?", expect: [/^Yes\b/i, /LPG/i, /CNG/i, /LNG/i], forbid: [/crude lifting/i] },
  { question: "What is your approach to safety?", expect: [/safety/i, /HSE/i], forbid: [/four divisions/i] },
  { question: "What makes Adalia different?", expect: [/Capacity|partner|technical/i], forbid: [/phone|contact page/i] },
  { question: "How can I become a business partner?", expect: [/partner/i, /contact form/i], forbid: [/mud logging/i] },
  { question: "How can I contact your company?", expect: [/website|contact/i], forbid: [/mud logging|LPG/i] }
];

const extras = [
  { question: "What kind of work does your company do?", expect: [/drilling|petroleum|gas/i] },
  { question: "Can Adalia support petroleum drilling operations?", expect: [/drill|petroleum/i] },
  { question: "Tell me more about drilling.", expect: [/drilling/i] },
  { question: "What about safety?", expect: [/safety/i] }
];

async function ask(messages) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  const data = await response.json();
  return { reply: data.reply || data.error || "", status: response.status };
}

const baselinePath = path.join(process.cwd(), "docs", "answer-baseline.json");
let baseline = [];
try {
  baseline = JSON.parse((await fs.readFile(baselinePath, "utf8")).replace(/^\uFEFF/, ""));
} catch {}

const results = [];
for (const check of checks) {
  const result = await ask([{ role: "user", content: check.question }]);
  const words = result.reply.trim().split(/\s+/).length;
  results.push({
    ...check,
    words,
    reply: result.reply,
    accurate:
      result.status === 200 &&
      check.expect.every((pattern) => pattern.test(result.reply)) &&
      !(check.forbid || []).some((pattern) => pattern.test(result.reply)) &&
      words <= 90
  });
}

const followUps = [
  "What services does Adalia provide?",
  "Tell me more about drilling.",
  "What about safety?"
];
const history = [];
for (const [index, question] of followUps.entries()) {
  history.push({ role: "user", content: question });
  const result = await ask(history);
  const check = [
    { expect: [/four divisions|drilling/i] },
    { expect: [/drilling/i] },
    { expect: [/safety/i] }
  ][index];
  results.push({
    question: `${question} (follow-up)`,
    words: result.reply.trim().split(/\s+/).length,
    accurate: result.status === 200 && check.expect.every((pattern) => pattern.test(result.reply)),
    expect: check.expect,
    forbid: [],
    reply: result.reply
  });
  history.push({ role: "assistant", content: result.reply });
}

for (const check of extras.slice(0, 2)) {
  const result = await ask([{ role: "user", content: check.question }]);
  results.push({
    ...check,
    words: result.reply.trim().split(/\s+/).length,
    accurate: result.status === 200 && check.expect.every((pattern) => pattern.test(result.reply)),
    forbid: []
  });
}

const passed = results.filter((row) => row.accurate).length;
const before = new Map(baseline.map((item) => [item.question, item]));

const lines = [
  "# Answer Optimisation Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `**Result: ${passed}/${results.length} passed**`,
  "",
  "| Question | Before (words) | After (words) | Relevant & concise |",
  "|---|---:|---:|---|",
  ...results.map((row) => {
    const old = before.get(row.question.replace(" (follow-up)", ""));
    return `| ${row.question} | ${old ? old.words : "—"} | ${row.words} | ${row.accurate ? "PASS" : "FAIL"} |`;
  }),
  "",
  "## Old vs new responses",
  "",
  ...results.flatMap((row) => {
    const old = before.get(row.question);
    return [
      `### ${row.question}`,
      "",
      old ? `**Before (${old.words} words):** ${old.reply}` : "**Before:** not captured",
      "",
      `**After (${row.words} words):** ${row.reply || "(see transcript)"}`,
      ""
    ];
  })
];

const reportPath = path.join(process.cwd(), "docs", "answer-optimization-report.md");
await fs.writeFile(reportPath, lines.join("\n"), "utf8");
console.log(`${passed}/${results.length} answer-quality checks passed. Report: ${reportPath}`);
const failed = results.filter((row) => !row.accurate);
if (failed.length) console.log("Failed: " + failed.map((row) => row.question).join(" | "));
