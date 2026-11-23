import { company, divisions, faqs, whyChoose, coreValues } from "@/data/company";
import type { KnowledgeRecord } from "./types";

/**
 * Verified company knowledge base.
 *
 * Every record is derived from published website content. Facts are sourced
 * from src/data/company.ts (the site's single source of truth) or from the
 * page/component named in `source`. Nothing here invents company details.
 * Records marked `general` are industry terminology only and must never be
 * presented as a company-specific claim.
 */

const SOURCE_DATE = "2026-11-17";

const records: KnowledgeRecord[] = [];

function add(record: Omit<KnowledgeRecord, "updatedAt">) {
  records.push({ ...record, updatedAt: SOURCE_DATE });
}

/* 1. Company overview ---------------------------------------------------- */
add({
  id: "overview-identity",
  category: "Company Overview",
  title: "Company identity and slogan",
  content: `${company.name} — ${company.slogan}. Foundation: ${company.foundation}. Official website: ${company.website}.`,
  source: "src/data/company.ts; src/app/layout.tsx; src/components/Footer.tsx",
  keywords: ["name", "who", "slogan", "identity", "foundation", "website", "about", "adalia"]
});
add({
  id: "overview-what-we-do",
  category: "Company Overview",
  title: "What Adalia does",
  content: `${company.about} ${company.about2}`,
  source: "src/data/company.ts (about, about2); src/app/page.tsx (Organization JSON-LD); FAQ 1",
  keywords: ["what", "do", "business", "company", "energy group", "value chain", "services", "overview", "nigeria", "international"]
});
add({
  id: "overview-four-divisions",
  category: "Products & Services",
  title: "The four business divisions",
  content: `Adalia operates through four divisions: ${divisions.map((d) => d.title).join("; ")}. Together they cover drilling support, crude lifting and marine logistics, gas supply and infrastructure, and petroleum procurement and distribution.`,
  source: "src/data/company.ts (divisions); src/components/DivisionsSection.tsx; FAQ 2",
  keywords: ["four", "divisions", "business units", "services", "offer", "capabilities", "portfolio"]
});
add({
  id: "overview-markets",
  category: "Company Overview",
  title: "Markets served",
  content: "The website states the company delivers energy solutions to clients in Nigeria and international markets.",
  source: "src/data/company.ts (about2, FAQ 1); src/app/layout.tsx (metadata)",
  keywords: ["nigeria", "international", "markets", "clients", "regions", "where", "operations"]
});

/* 2. History and background ---------------------------------------------- */
add({
  id: "history-growth",
  category: "Company History & Background",
  title: "Company background and growth",
  content: company.aboutLong[0],
  source: "src/data/company.ts (aboutLong[0]); About page (Read more)",
  keywords: ["history", "background", "story", "founded", "growth", "started", "began", "journey"]
});
add({
  id: "history-outlook",
  category: "Company History & Background",
  title: "Future outlook",
  content: company.aboutLong[6],
  source: "src/data/company.ts (aboutLong[6]); About page (Read more)",
  keywords: ["future", "outlook", "ahead", "ambition", "goal", "vision", "growth", "sustainable"]
});
add({
  id: "history-single-partner",
  category: "Company Overview",
  title: "Single accountable partner",
  content: company.aboutLong[3],
  source: "src/data/company.ts (aboutLong[3]); About page (Read more)",
  keywords: ["one group", "single", "partner", "accountable", "different", "advantage", "integrated", "contractors"]
});

/* 3. Vision and mission --------------------------------------------------- */
add({
  id: "vision",
  category: "Vision & Mission",
  title: "Our vision",
  content: `Vision: ${company.vision}`,
  source: "src/data/company.ts (vision); src/components/AboutSection.tsx; Footer /about#vision",
  keywords: ["vision", "aspiration", "leading", "african", "future"]
});
add({
  id: "mission",
  category: "Vision & Mission",
  title: "Our mission",
  content: `Mission: ${company.mission}`,
  source: "src/data/company.ts (mission); src/components/AboutSection.tsx; Footer /about#mission",
  keywords: ["mission", "purpose", "deliver", "world-class", "value", "clients", "communities"]
});

/* 4. Core values and differentiators ------------------------------------- */
coreValues.forEach((value, i) => {
  add({
    id: `core-value-${i + 1}`,
    category: "Core Values",
    title: value,
    content: `${value} is listed among Adalia's core values. ${value === "Safety First." ? "The company states that safety is its first priority across all divisions." : ""} ${value === "Excellence." ? "Excellence is part of the company slogan, 'Driven by Excellence. Powering Energy.'" : ""}`.trim(),
    source: "src/data/company.ts (coreValues); src/components/ValuesSection.tsx; src/components/HSESection.tsx",
    keywords: [value.toLowerCase().replace(/\./g, ""), "values", "principles", "culture"]
  });
});
whyChoose.forEach((item, i) => {
  add({
    id: `why-choose-${i + 1}`,
    category: "Core Values",
    title: item,
    content: `"${item}" is published as a reason to choose Adalia Oil and Gas Ltd.`,
    source: "src/data/company.ts (whyChoose); src/components/WhyChooseSection.tsx",
    keywords: [...item.toLowerCase().split(/\W+/).filter((w) => w.length > 3), "why choose", "strength", "advantage", "different"]
  });
});

/* 5-8. Divisions, drilling, lifting, gas, petroleum ---------------------- */
const divisionCategory: Record<string, string> = {
  "drilling-services": "Drilling Operations",
  "crude-lifting-marine-logistics": "Lifting Operations",
  gas: "Gas Services",
  "petroleum-supply": "Petroleum Services"
};

divisions.forEach((division) => {
  add({
    id: `division-${division.slug}`,
    category: "Products & Services",
    title: division.title,
    content: `${division.short} Published services: ${division.services.join(" ")}`,
    source: `src/data/company.ts (division: ${division.slug}); src/app/divisions/${division.slug}/page.tsx`,
    keywords: [division.title.toLowerCase(), ...division.short.toLowerCase().split(/\W+/).filter((w) => w.length > 3), "division", "services", "capabilities"]
  });
  division.services.forEach((service, i) => {
    add({
      id: `${division.slug}-service-${i + 1}`,
      category: divisionCategory[division.slug] ?? "Products & Services",
      title: `${division.title}: ${service}`,
      content: `Under ${division.title}, Adalia publishes the service: ${service} ${division.short}`,
      source: `src/data/company.ts (division ${division.slug} services); src/app/divisions/${division.slug}/page.tsx`,
      keywords: [...service.toLowerCase().split(/\W+/).filter((w) => w.length > 3), division.slug.replace(/-/g, " "), "service", "capability"]
    });
  });
});

/* 9. Technical capabilities ---------------------------------------------- */
add({
  id: "technical-capabilities",
  category: "Technical Capabilities",
  title: "Technical capabilities overview",
  content: "The website describes technical depth, logistical reach and commercial discipline, and an integrated service range from the first borehole to final petroleum delivery. Published capabilities include well drilling, completion and workover, well intervention and testing, mud logging, drilling equipment supply and maintenance, crude evacuation, vessel chartering, offshore supply, storage and terminal operations, gas plant installation and maintenance, gas filling, reticulation and pipeline support, and bulk petroleum supply.",
  source: "src/data/company.ts (aboutLong[0], aboutLong[3], divisions); src/components/HeroSlider.tsx",
  keywords: ["technical", "capability", "expertise", "equipment", "borehole", "engineering", "what can you do"]
});

/* 10. Workforce and expertise -------------------------------------------- */
add({
  id: "workforce",
  category: "Workforce & Technical Expertise",
  title: "Technical team and expertise",
  content: "The website states Adalia has an 'Experienced Technical Team' and describes 'experienced professionals delivering safe, efficient and dependable energy operations.' It also states the company invests in its people and maintains a culture where every team member is empowered to stop any task that is not safe.",
  source: "src/data/company.ts (whyChoose[1], aboutLong[4]); src/components/HeroSlider.tsx; src/components/WhyChooseSection.tsx",
  keywords: ["team", "expertise", "experienced", "technical", "people", "staff", "workforce", "professionals", "trained"]
});

/* 11. HSE ---------------------------------------------------------------- */
add({
  id: "hse-statement",
  category: "Health, Safety & Environment",
  title: "HSE commitment",
  content: `${company.hse}`,
  source: "src/data/company.ts (hse); src/components/HSESection.tsx; src/app/hse/page.tsx",
  keywords: ["safety", "hse", "health", "environment", "safe handling", "transportation", "standards"]
});
add({
  id: "hse-focus",
  category: "Health, Safety & Environment",
  title: "HSE focus areas",
  content: "Published HSE focus areas: Safety First, Environmental Responsibility, Operational Excellence, Risk Management and Personnel Protection.",
  source: "src/components/HSESection.tsx (points array)",
  keywords: ["safety", "environment", "risk", "protection", "ppe", "excellence", "hse", "priorities"]
});
add({
  id: "hse-culture",
  category: "Health, Safety & Environment",
  title: "Safety culture across divisions",
  content: company.aboutLong[4],
  source: "src/data/company.ts (aboutLong[4]); About page (Read more)",
  keywords: ["safety", "culture", "risk", "stop work", "people", "environment", "responsibility"]
});

/* 12. Quality ------------------------------------------------------------- */
add({
  id: "quality",
  category: "Quality Management",
  title: "Quality and reliability commitments",
  content: "The website states a strong focus on quality, transparency and timely delivery, a 'Strong Safety and Quality Culture', and 'Transparent and Trusted Business Dealings'. It also says service descriptions are subject to discussion and confirmation through direct engagement with the team.",
  source: "src/data/company.ts (about2, whyChoose); src/app/terms/page.tsx",
  keywords: ["quality", "reliability", "transparent", "timely", "delivery", "assurance", "standards"]
});

/* 13. Projects and experience — explicitly unavailable ------------------- */
add({
  id: "projects-unavailable",
  category: "Projects & Experience",
  title: "Published project history",
  content: "No project names, case studies, client references, contracts, operational achievements or years-of-experience figures are published on this website. The gallery contains illustrative captions only and does not document specific projects. This information is unavailable on the website; the company team can provide clarification through the Contact page.",
  source: "Website-wide audit: src/data/company.ts, GallerySection.tsx, README.md (no fabricated achievements)",
  keywords: ["project", "projects", "experience", "clients", "case study", "track record", "achievements", "years", "contracts", "references"]
});

/* 14. Partnerships -------------------------------------------------------- */
add({
  id: "partnerships",
  category: "Business Partnerships",
  title: "Partnership approach",
  content: `${company.aboutLong[5]} ${whyChoose[5]} is also published as a strength.`,
  source: "src/data/company.ts (aboutLong[5], whyChoose[5]); src/components/WhyChooseSection.tsx",
  keywords: ["partnership", "partner", "collaboration", "local", "international", "community", "joint venture", "business relationship"]
});
add({
  id: "partnership-how",
  category: "Business Partnerships",
  title: "How to establish a partnership",
  content: faqs.find((f) => f.q.toLowerCase().includes("partnership"))?.a ?? "",
  source: "src/data/company.ts (FAQ 8); Contact form option 'Strategic Partnership'",
  keywords: ["how", "partner", "partnership", "strategic", "contact form", "business"]
});

/* 15. Operational / enquiry procedures ----------------------------------- */
add({
  id: "enquiry-process",
  category: "Operational Procedures",
  title: "Requesting a quotation or consultation",
  content: `${faqs.find((f) => f.q.toLowerCase().includes("quotation"))?.a ?? ""} The contact form asks for full name, company name, email, phone number, country, division of interest, subject and message.`,
  source: "src/data/company.ts (FAQ 9); src/components/ContactSection.tsx",
  keywords: ["quote", "quotation", "consultation", "enquiry", "request", "how", "form", "process"]
});
add({
  id: "privacy-policy",
  category: "Operational Procedures",
  title: "Privacy policy summary",
  content: "The website states that contact, consultation, quotation and partnership enquiries may collect name, company name, email, phone, country, division of interest and message details; the information is used solely to respond to enquiries and support business communications, is not sold, and is shared only as necessary or where required by applicable obligations. Submitting details through forms or chatbot lead capture indicates consent to that use.",
  source: "src/app/privacy/page.tsx",
  keywords: ["privacy", "data", "personal information", "consent", "policy", "security", "gdpr"]
});
add({
  id: "terms-of-use",
  category: "Operational Procedures",
  title: "Terms of use summary",
  content: "The website states that content is provided for general information, service descriptions are subject to discussion and confirmation, submitting an enquiry does not create a binding contract, any relationship or quotation is established through direct communication and agreed terms, and website content and branding belong to Adalia or are used with permission.",
  source: "src/app/terms/page.tsx",
  keywords: ["terms", "conditions", "contract", "legal", "website use", "intellectual property"]
});

/* 16. Contact information ------------------------------------------------ */
add({
  id: "contact-overview",
  category: "Contact Information",
  title: "How to contact Adalia",
  content: `Official website: ${company.website}. The website also provides social links: WhatsApp, Instagram and Facebook. Use the Contact page or the 'Request a Consultation' form for enquiries.`,
  source: "src/data/company.ts (website, social); src/components/ContactSection.tsx; src/components/Footer.tsx",
  keywords: ["contact", "reach", "website", "get in touch", "social", "whatsapp", "instagram", "facebook", "enquiry"]
});
add({
  id: "contact-details-unavailable",
  category: "Contact Information",
  title: "Phone, email, address and RC number",
  content: "The website currently displays placeholders rather than published values for phone number ([Your Phone]), email address ([Your Email]), physical address ([Your Address]) and RC number ([Your RC Number]). No verified phone, email, office location or registration number is published. Please use the Contact page or request a consultation for direct communication.",
  source: "src/data/company.ts (phone, email, address, rcNumber); src/components/ContactSection.tsx; src/components/Footer.tsx; README.md",
  keywords: ["phone", "telephone", "call", "email", "mail", "address", "location", "office", "rc", "registration", "number", "contact details"]
});

/* 17. FAQs --------------------------------------------------------------- */
faqs.forEach((faq, i) => {
  add({
    id: `faq-${i + 1}`,
    category: "Frequently Asked Questions",
    title: faq.q,
    content: faq.a,
    source: `src/data/company.ts (FAQ ${i + 1}); src/components/FAQSection.tsx; src/app/faq/page.tsx`,
    keywords: [...faq.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3), "faq", "question", "answer"]
  });
});

/* 18. Website structure --------------------------------------------------- */
add({
  id: "website-pages",
  category: "Other Relevant Company Information",
  title: "Website pages and navigation",
  content: "The website has Home, About Us, Services, HSE, Contact Us and FAQs pages, four division pages under /divisions/, plus Privacy Policy and Terms of Use. Visitors can request a consultation from the contact page.",
  source: "src/components/Navbar.tsx; src/components/Footer.tsx; src/app/sitemap.ts",
  keywords: ["pages", "navigation", "menu", "website", "where to find", "links", "sitemap"]
});

/* 19. Explicit knowledge limits ------------------------------------------ */
add({
  id: "unverified-details",
  category: "Other Relevant Company Information",
  title: "Details not published on the website",
  content: "The following are not published and therefore cannot be confirmed by this assistant: certifications or accreditations, licences, named clients or partners, project history, years of experience, equipment specifications, capacities, prices, operational achievements, office address, phone number, email address, RC number, employee numbers and named personnel. Where a detail is unavailable, the correct response is to say so and direct the visitor to the Contact page.",
  source: "Website-wide audit; README.md; src/data/company.ts placeholders",
  keywords: ["certification", "licence", "iso", "client", "price", "cost", "capacity", "equipment", "employees", "staff count", "awards", "unknown", "not available", "unverified"]
});

/* 20. General terminology (never a company claim) ------------------------ */
const glossary: Array<[string, string, string[]]> = [
  ["drilling", "Drilling is the process of creating a borehole to reach oil or gas reservoirs. This is general industry terminology, not a claim about Adalia's equipment or projects.", ["drill", "borehole", "well", "rig"]],
  ["workover", "A workover is maintenance or repair work on an existing well to restore or improve production. This is general industry terminology.", ["well", "maintenance", "repair"]],
  ["mud logging", "Mud logging is the recording and analysis of drilling fluid and rock cuttings while drilling. This is general industry terminology.", ["mud", "logging", "cuttings", "fluid"]],
  ["crude lifting", "Crude lifting is the transfer and transportation of crude oil from production facilities to storage, terminals or export vessels. This is general industry terminology.", ["crude", "evacuation", "lifting"]],
  ["vessel chartering", "Vessel chartering is hiring a ship or marine vessel for transport or offshore support. This is general industry terminology.", ["ship", "marine", "charter", "vessel"]],
  ["LPG", "LPG means Liquefied Petroleum Gas, a fuel used for cooking, heating and industrial processes. This is general industry terminology.", ["lpg", "gas", "cooking", "fuel"]],
  ["CNG", "CNG means Compressed Natural Gas, used as a vehicle and industrial fuel. This is general industry terminology.", ["cng", "gas", "vehicle", "fuel"]],
  ["LNG", "LNG means Liquefied Natural Gas, natural gas cooled to liquid form for storage and transport. This is general industry terminology.", ["lng", "gas", "liquefied"]],
  ["petroleum products", "PMS (Premium Motor Spirit), AGO (Automotive Gas Oil), DPK (Dual Purpose Kerosene), base oil and lubricants are common petroleum product categories. These are general industry terms; the website does not publish specifications or prices.", ["pms", "ago", "dpk", "fuel", "diesel", "kerosene", "lubricants"]],
  ["reticulation", "Reticulation is the distribution of gas through a network of pipes to end users. This is general industry terminology.", ["pipeline", "gas", "distribution", "network"]],
  ["HSE", "HSE stands for Health, Safety and Environment. This is general industry terminology.", ["hse", "health", "safety", "environment"]]
];
glossary.forEach(([title, content, keywords], i) => {
  add({
    id: `glossary-${i + 1}`,
    category: "General Terminology",
    title,
    content,
    source: "General industry knowledge — not a verified company fact",
    keywords,
    general: true
  });
});

export const companyKnowledge: KnowledgeRecord[] = records;
