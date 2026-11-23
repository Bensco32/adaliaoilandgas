import { companyKnowledge } from "./company-knowledge";
import type { RetrievalResult } from "./types";

/**
 * Intent detection for concise, question-specific answers.
 * Answers are still generated from retrieved knowledge records — this module
 * only decides which records are relevant and how long the answer should be.
 */

export type Intent =
  | "services-overview"
  | "drilling"
  | "lifting"
  | "gas"
  | "petroleum"
  | "safety"
  | "differentiator"
  | "partnership"
  | "contact"
  | "capabilities"
  | "workforce"
  | "unavailable"
  | "general-terminology"
  | "greeting"
  | "identity"
  | "thanks"
  | "other";

export interface IntentAnalysis {
  intent: Intent;
  yesNo: boolean;
  wantsDetail: boolean;
  preferredIds: string[];
  allowedCategories: string[];
  maxRecords: number;
  wordBudget: number;
}

const UNAVAILABLE_PATTERNS = [
  /\b(iso|certification|certified|accreditation|licence|license|permit)\b/i,
  /\b(project|projects|case study|case studies|client|clients|contract|contracts|track record|achievement|award)\b/i,
  /\b(years? of experience|how many years|founded in|established in|since \d{4})\b/i,
  /\b(price|prices|cost|rate|how much does|capacity|capacities|tonnage|volume)\b/i,
  /\b(equipment spec|specification|rig name|fleet size|number of vessels|how many employees|staff count|employee count)\b/i,
  /\b(office|physical location|where are you located|rc number|registration number)\b/i
];

const GENERAL_PATTERN = /^(what (is|are)|what does .{1,25} mean)\b|\b(meaning|stands for|define|definition|in general|terminology)\b/i;

/** Company name is removed so "Gas Ltd" never reads as a gas-services question. */
function normalized(text: string): string {
  return text
    .replace(/adaliaoilandgasltd|adalia oil and gas ltd|adalia oil and gas|adalia/gi, " ")
    .replace(/oil and gas/gi, " ");
}

export function analyzeIntent(question: string): IntentAnalysis {
  const raw = question.trim();
  const text = normalized(raw);
  const wantsDetail = /\b(detail|detailed|explain|elaborate|full|complete|in depth|comprehensive|structure|compare)\b/i.test(raw);
  const yesNo = /^(do|does|can|is|are|have|has|will|could|would)\b/i.test(raw);

  const base = (intent: Intent, extra: Partial<IntentAnalysis> = {}): IntentAnalysis => ({
    intent,
    yesNo,
    wantsDetail,
    preferredIds: [],
    allowedCategories: [],
    maxRecords: wantsDetail ? 3 : 2,
    wordBudget: wantsDetail ? 150 : 65,
    ...extra
  });

  if (/^(hi|hello|hey|good (morning|afternoon|evening)|greetings)\b/i.test(raw)) return base("greeting", { wordBudget: 40 });
  if (/^(thank(s| you)|thanks a lot|appreciate it)\b/i.test(raw)) return base("thanks", { wordBudget: 30 });
  if (/\b(who are you|what are you|your name)\b/i.test(raw)) return base("identity", { wordBudget: 45 });
  if (UNAVAILABLE_PATTERNS.some((pattern) => pattern.test(text))) return base("unavailable", { wordBudget: 55 });
  const pureDefinition = GENERAL_PATTERN.test(raw) &&
    /^what (is|are) [a-z0-9 -]{1,30}\??$/i.test(raw) &&
    !/\b(your|adalia|company|approach|services|divisions|safety|business)\b/i.test(raw);
  if (pureDefinition) return base("general-terminology", { maxRecords: 1, wordBudget: 60 });

  if (/\b(drill\w*|borehole|well\w*|rig\w*|mud[- ]?log\w*)\b/i.test(text)) {
    return base("drilling", {
      preferredIds: ["division-drilling-services", "faq-3"],
      allowedCategories: ["Drilling Operations"],
      maxRecords: wantsDetail ? 3 : 1,
      wordBudget: yesNo ? 50 : 65
    });
  }
  if (/\b(crude|lift\w*|marine|vessel|ship\w*|logistic\w*|charter\w*|evacuat\w*|terminal\w*|offshore supply)\b/i.test(text)) {
    return base("lifting", {
      preferredIds: ["division-crude-lifting-marine-logistics", "faq-4", "faq-5"],
      allowedCategories: ["Lifting Operations"],
      maxRecords: wantsDetail ? 3 : 1,
      wordBudget: yesNo ? 50 : 65
    });
  }
  if (/\b(lpg|cng|lng|gas plant|reticulat\w*|pipeline\w*)\b/i.test(text)) {
    return base("gas", {
      preferredIds: ["division-gas", "faq-6"],
      allowedCategories: ["Gas Services"],
      maxRecords: wantsDetail ? 3 : 1,
      wordBudget: yesNo ? 55 : 65
    });
  }
  if (/\b(petroleum|pms|ago|dpk|fuel\w*|lubricant\w*|diesel|kerosene|base oil)\b/i.test(text)) {
    return base("petroleum", {
      preferredIds: ["division-petroleum-supply", "faq-7"],
      allowedCategories: ["Petroleum Services"],
      maxRecords: wantsDetail ? 3 : 1,
      wordBudget: yesNo ? 50 : 65
    });
  }
  if (/\b(safet\w*|hse|health|environment\w*|ppe|risk\w*|accident\w*)\b/i.test(text)) {
    return base("safety", {
      preferredIds: ["hse-statement", "hse-focus"],
      allowedCategories: ["Health, Safety & Environment"],
      maxRecords: wantsDetail ? 3 : 1,
      wordBudget: 65
    });
  }
  if (/\b(differen\w*|advantage\w*|unique|why choose|strength\w*|better)\b/i.test(text)) {
    return base("differentiator", {
      preferredIds: ["why-choose-1", "history-single-partner", "workforce"],
      allowedCategories: ["Core Values", "Company Overview", "Workforce & Technical Expertise", "Health, Safety & Environment"],
      maxRecords: wantsDetail ? 4 : 2,
      wordBudget: 80
    });
  }
  if (/\b(partner\w*|collaborat\w*|joint venture|business relationship)\b/i.test(text)) {
    return base("partnership", {
      preferredIds: ["partnership-how", "partnerships"],
      allowedCategories: ["Business Partnerships"],
      maxRecords: 2,
      wordBudget: 60
    });
  }
  if (/\b(contact\w*|phone|call|email|address|website|reach|rc number|social|whatsapp)\b/i.test(text)) {
    return base("contact", {
      preferredIds: ["contact-overview", "contact-details-unavailable"],
      allowedCategories: ["Contact Information"],
      maxRecords: 2,
      wordBudget: 60
    });
  }
  if (/\b(team|people|staff|employee\w*|workforce|qualified)\b/i.test(text)) {
    return base("workforce", {
      preferredIds: ["workforce", "why-choose-2"],
      allowedCategories: ["Workforce & Technical Expertise"],
      maxRecords: 2,
      wordBudget: 60
    });
  }
  if (/\b(capabilit\w*|operational|technical|what can you do|expertise)\b/i.test(text)) {
    return base("capabilities", {
      preferredIds: ["technical-capabilities", "overview-four-divisions"],
      allowedCategories: ["Technical Capabilities", "Products & Services"],
      maxRecords: wantsDetail ? 3 : 2,
      wordBudget: 80
    });
  }
  if (/\b(service\w*|offer\w*|product\w*|division\w*|what do you do|kind of work|business)\b/i.test(text)) {
    return base("services-overview", {
      preferredIds: ["overview-four-divisions", "faq-2", "overview-what-we-do"],
      allowedCategories: ["Products & Services", "Company Overview"],
      maxRecords: wantsDetail ? 3 : 2,
      wordBudget: 60
    });
  }

  return base("other", { maxRecords: 2, wordBudget: 60 });
}

const IRRELEVANT_IDS = new Set(["projects-unavailable", "unverified-details"]);

/** Keeps only records relevant to the detected intent, preserving knowledge order. */
export function filterByIntent(results: RetrievalResult[], analysis: IntentAnalysis): RetrievalResult[] {
  if (analysis.intent === "unavailable") {
    return results.filter((item) => IRRELEVANT_IDS.has(item.record.id) || item.record.id.startsWith("contact-details")).slice(0, 1);
  }
  if (analysis.intent === "general-terminology" || analysis.intent === "greeting" || analysis.intent === "identity" || analysis.intent === "thanks") {
    return results.slice(0, 1);
  }

  // Preferred records are authoritative for an intent even if semantic search ranked
  // them just outside the top results. They are added from the verified knowledge base.
  const withPreferred = [...results];
  for (const id of analysis.preferredIds) {
    if (withPreferred.some((item) => item.record.id === id)) continue;
    const record = companyKnowledge.find((item) => item.id === id);
    if (record) withPreferred.unshift({ record, score: 1 });
  }

  const preferred = analysis.preferredIds
    .map((id) => withPreferred.find((item) => item.record.id === id))
    .filter((item): item is RetrievalResult => Boolean(item));
  const allowed = withPreferred.filter(
    (item) =>
      !preferred.includes(item) &&
      !IRRELEVANT_IDS.has(item.record.id) &&
      !item.record.general &&
      (analysis.allowedCategories.includes(item.record.category) || item.record.id.startsWith("faq-"))
  );

  const ordered = [...preferred, ...allowed];
  return (ordered.length ? ordered : withPreferred.filter((item) => !IRRELEVANT_IDS.has(item.record.id) && !item.record.general)).slice(0, analysis.maxRecords);
}
