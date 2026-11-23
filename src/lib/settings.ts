/**
 * Editable company settings store.
 *
 * All public-site content that the company might verify (company profile,
 * services, projects, compliance certificates, HSE policies, governance
 * documents, supplier registrations, enquiries) lives here so the admin
 * dashboard can manage it. Server-only module: never import from client files.
 *
 * Storage: `data/settings.json` written atomically. This is the same storage
 * convention as the knowledge base (`data/knowledge-*.json`). On hosting
 * platforms with ephemeral disks, deploy the site image with `data/`
 * pre-seeded or export the file and restore it — see LAUNCH_READINESS_REPORT.md.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { company, divisions, type CompanySocial } from "@/data/company";

export const DATA_DIR =
  process.env.ADALIA_DATA_DIR?.trim() || path.join(process.cwd(), "data");
export const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export interface ManagementMember {
  name: string;
  title: string;
  bio: string;
  linkedin?: string;
  verified: boolean;
}

export interface CompanyProfile {
  name: string;
  slogan: string;
  foundation: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  rcNumber: string;
  addressRequiresVerification: boolean;
  phoneRequiresVerification: boolean;
  emailRequiresVerification: boolean;
  rcNumberRequiresVerification: boolean;
  addressVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  rcNumberVerified: boolean;
  social: CompanySocial;
  about: string;
  about2: string;
  aboutLong: string[];
  vision: string;
  mission: string;
  hse: string;
  objectives: string[];
  management: ManagementMember[];
  coreValues: string[];
}

export interface ServiceRecord {
  id: string;
  title: string;
  division: string;
  description: string;
  objectives: string[];
  capabilities: string[];
  image: string;
  verified: boolean;
}

export type ComplianceStatus = "issued" | "application" | "not_submitted" | "pending_verification";

export interface ComplianceCertificate {
  id: string;
  title: string;
  category: string; // CAC registration, NUPRC permit, NMDPRA licence, Environmental approval, Safety certification, Other permit
  authority: string;
  reference: string;
  issueDate: string | null;
  expiryDate: string | null;
  status: ComplianceStatus;
  verified: boolean;
  documentUrl: string; // served by /documents/...
  certificateId: string;
  note: string;
}

export type HsePolicyStatus = "draft" | "approved" | "published";

export interface HsePolicyDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string | null;
  status: HsePolicyStatus;
  verified: boolean;
  downloadable: boolean;
  documentUrl: string;
  content: string; // admin-editable policy body (markdown-ish text)
}

export interface GovernanceDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string | null;
  status: HsePolicyStatus;
  verified: boolean;
  documentUrl: string;
  content: string;
}

export interface ProjectRecord {
  id: string;
  title: string;
  location: string;
  description: string;
  client: string;
  partner: string;
  completionDate: string | null;
  status: string; // e.g. Completed, In progress, Proposed
  images: string[];
  verified: boolean;
}

export interface SupplierRegistration {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  servicesDescription: string;
  cacRegistration: string;
  documents: Array<{ name: string; path: string; uploadedAt: string }>;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  note: string;
  submittedAt: string;
}

export interface EnquiryRecord {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  country: string;
  division: string;
  subject: string;
  message: string;
  receivedAt: string;
  delivery: { email: string; whatsapp: string; details: Record<string, string> };
  read: boolean;
}

export interface ActivityLogEntry {
  id: string;
  at: string;
  action: string;
  detail: string;
}

export interface Settings {
  version: number;
  company: CompanyProfile;
  services: ServiceRecord[];
  projects: ProjectRecord[];
  compliance: ComplianceCertificate[];
  hsePolicies: HsePolicyDocument[];
  governanceDocs: GovernanceDocument[];
  supplierRegistrations: SupplierRegistration[];
  enquiries: EnquiryRecord[];
  activity: ActivityLogEntry[];
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function seedCompany(): CompanyProfile {
  return {
    name: company.name,
    slogan: company.slogan,
    foundation: company.foundation,
    website: company.website,
    address: company.address,
    phone: company.phone,
    email: company.email,
    rcNumber: company.rcNumber,
    addressRequiresVerification: company.addressRequiresVerification,
    phoneRequiresVerification: company.phoneRequiresVerification,
    emailRequiresVerification: company.emailRequiresVerification,
    rcNumberRequiresVerification: company.rcNumberRequiresVerification,
    addressVerified: false,
    phoneVerified: false,
    emailVerified: false,
    rcNumberVerified: false,
    social: {
      whatsapp: company.social.whatsapp,
      instagram: company.social.instagram,
      facebook: company.social.facebook
    },
    about: company.about,
    about2: company.about2,
    aboutLong: [...company.aboutLong],
    vision: company.vision,
    mission: company.mission,
    hse: company.hse,
    objectives: [...company.objectives],
    management: [...(company.management ?? [])],
    coreValues: [...company.coreValues]
  };
}

function seedCompliance(): ComplianceCertificate[] {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Array<Omit<ComplianceCertificate, "id" | "documentUrl" | "certificateId">> = [
    {
      title: "Certificate of Incorporation - ADALIA OIL AND GAS LTD",
      category: "CAC registration",
      authority: "Corporate Affairs Commission (Nigeria)",
      reference: company.rcNumber,
      issueDate: null,
      expiryDate: null,
      status: company.rcNumberRequiresVerification ? "application" : "issued",
      verified: false,
      note: "Requires verification of the Company Registration Number (RC) and the certificate document."
    },
    {
      title: "Exploration License",
      category: "NUPRC permit",
      authority: "Nigerian Regulatory Commission for Oil and Gas Services",
      reference: "",
      issueDate: null,
      expiryDate: null,
      status: "application",
      verified: false,
      note: "Whether exploration or production licenses are required for the advertised activities depends on jurisdiction. Verify with the applicable regulator before publication."
    },
    {
      title: "Company Compliance Licence / NMDPRA Licence",
      category: "NMDPRA licence",
      authority: "Nigerian National Petroleum Industry Regulatory Commission (NUPERC successor)",
      reference: "",
      issueDate: null,
      expiryDate: null,
      status: "application",
      verified: false,
      note: "Verify applicability to the services offered with the regulator. Publication is pending verification."
    },
    {
      title: "Environmental Impact Assessment Approval",
      category: "Environmental approval",
      authority: "National Environmental Standards and Regulations Enforcement Agency (NESREA)",
      reference: "",
      issueDate: null,
      expiryDate: null,
      status: "application",
      verified: false,
      note: "Applicability depends on the scope of each activity. Verify before publication."
    },
    {
      title: "ISO 45001 Occupational Health and Safety Management System Certification",
      category: "Safety certification",
      authority: "International Organization for Standardization (ISO)",
      reference: "",
      issueDate: null,
      expiryDate: null,
      status: "not_submitted",
      verified: false,
      note: "No safety certifications are presented as active until the company supplies verified evidence."
    },
    {
      title: "Other Industry Permits (e.g. contractor registration, state operating licences)",
      category: "Other permit",
      authority: "Various (state and industry bodies)",
      reference: "",
      issueDate: null,
      expiryDate: null,
      status: "application",
      verified: false,
      note: "Each entry in this category is verified individually before being marked issued and published."
    }
  ];
  return entries.map((e, i) => ({
    ...e,
    id: newId(`cert-${i + 1}`),
    documentUrl: "",
    certificateId: "",
    verified: false
  }));
}

function seedHsePolicies(): HsePolicyDocument[] {
  const policies: Array<{ title: string; category: string; content: string }> = [
    {
      title: "Health and Safety Policy",
      category: "Health and safety policy",
      content:
        "Adalia OIL AND GAS LTD is committed to providing a safe and healthy work environment for all personnel. This policy is signed by the management team and reviewed annually.\n\nObjectives:\n- Eliminate preventable injuries and work-related ill health.\n- Maintain a positive safety culture through leadership and accountability.\n- Ensure all hazards are identified, assessed and controlled before work begins.\n- Give every team member the authority to stop unsafe work without penalty.\n\nScope: This policy applies to all operations of Adalia OIL AND GAS LTD and all contractors working on Adalia sites. It is governed by the applicable HSE procedures and legal requirements.\n\nManagement commitment:\nAdalia senior management commits to making safety and health a core business objective, providing the necessary resources, and encouraging continuous improvement of safety performance."
    },
    {
      title: "Environmental Protection Policy",
      category: "Environmental protection policy",
      content:
        "Adalia OIL AND GAS LTD is committed to minimising harm to the environment and protecting the communities we work in.\n\nObjectives:\n- Minimise the environmental footprint of all operations.\n- Prevent spills, leaks and emissions that could affect people or the environment.\n- Ensure all activities comply with applicable environmental legislation.\n- Incorporate environmental considerations into every design, procurement and operating decision.\n\nScope: This policy covers all Adalia activities, including surface and offshore operations, transport, storage and waste management. It applies to all contractors.\n\nCommitment:\nAdalia is responsible for environmental compliance, and every employee and contractor is responsible for reporting hazards and preventing pollution without delay."
    },
    {
      title: "Workplace Safety Procedures",
      category: "Workplace safety procedures",
      content:
        "Adalia requires all personnel to follow approved safety procedures.\n\nKey requirements:\n- PPE must be worn where required for the activity and its risk assessment.\n- Work areas must be kept clean and free of trip hazards.\n- Tools and equipment must be inspected before use and only used as instructed.\n- Job Safety Analyses and Method Statements are required before high-risk work.\n- Emergency exits and assembly points must remain unobstructed at all times.\n- All incidents must be reported through the incident reporting procedure without fear of reprisal."
    },
    {
      title: "Risk Assessment and Hazard Identification",
      category: "Risk assessment and hazard identification",
      content:
        "Risk assessments are required for all identified hazards that could cause injury, illness or loss.\n\nProcess:\n- Identify hazards and list the people affected.\n- Identify who might be harmed and how.\n- Evaluate risks and decide if a reasonable precaution should be used.\n- If the existing precautions are not enough, put better ones in place.\n- Review assessments whenever something changes in the workplace or an incident occurs.\n\nRecord keeping: completed assessments are signed and dated and reviewed with personnel working in the area.\n\nPrinciple: the 'worst credible case' determines the risk rating; hazard elimination is the first line of defence."
    },
    {
      title: "Emergency Preparedness and Response",
      category: "Emergency preparedness and response",
      content:
        "Adalia maintains an active emergency response capability.\n\nContents of the emergency plan:\n- Roles and responsibilities for managers, team leaders and safety officers during an emergency.\n- Emergency contact lists, including local emergency services numbers.\n- Evacuation procedures, assembly points and roll call arrangements.\n- Incident notification procedures to authorities and internal stakeholders.\n- Communication plans for customers and the community.\n\nPreparedness:\n- Emergency drills are conducted regularly.\n- Spare equipment and supplies are maintained in strategic locations.\n- All persons are trained on emergency response and evacuation."
    },
    {
      title: "Incident Reporting Procedure",
      category: "Incident reporting",
      content:
        "All Incidents must be reported promptly.\n\nDefinition: an incident is any unplanned event or near miss that did or could cause injury, illness, damage to property, damage to the environment, or interruption to business.\n\nProcedure:\n- Report immediately to the site manager or team leader.\n- Complete an incident report form, including date, time, location, people involved and a factual description of the event.\n- Do not disclose information to others not directly involved unless required by management.\n- Management investigates every incident within a set timeframe, identifies causes and takes corrective actions.\n- Investigation findings and lessons are recorded and shared with the team."
    },
    {
      title: "Waste Management Policy",
      category: "Waste management",
      content:
        "Adalia will minimise and manage waste responsibly.\n\nRequirements:\n- Waste generated at every site is segregated into streams (e.g. hazardous, non-hazardous, recyclable) per applicable local regulations.\n- Waste is stored in approved containers with proper labelling and signs.\n- Waste consignment records (Manifests) are maintained where required by law.\n- Waste removal is only through licensed disposal facilities.\n- Site personnel and contractors are trained on waste handling.\n- Site management regularly reviews waste performance.\n\nObjective: Adalia aims for zero uncontrolled waste discharge and a reduction in waste generation year on year."
    },
    {
      title: "Pollution Prevention Policy",
      category: "Pollution prevention",
      content:
        "Adalia is committed to preventing pollution of the air, water and soil.\n\nMeasures:\n- No discharges, spills or releases may be made without proper permits and controls.\n- Spill prevention procedures are in place for fuel, lubricants and chemicals on sites.\n- Spill response equipment is available and maintained.\n- Engine room, storage and workshop areas are protected with drip trays, bunded areas or secondary containment.\n- Fluid leaks are corrected promptly.\n- Stormwater runoff from sites is treated to prevent contamination."
    },
    {
      title: "Employee Safety Training",
      category: "Employee safety training",
      content:
        "Safety training keeps personnel safe.\n\nRequirements:\n- Induction training for every new employee, covering site orientation, hazard identification, PPE and emergency procedures.\n- Role-specific training as required by the work being performed (e.g. first aid, confined space, lifting, H2S awareness, forklift, crane operation).\n- Refresher training at regular intervals and after relevant incidents or changes.\n- Attendance and completion records are maintained for every training session.\n- Training effectiveness is reviewed through assessments or observation."
    },
    {
      title: "Contractor Safety Management",
      category: "Contractor safety management",
      content:
        "Contractors are managed under the same safety standards as our own personnel.\n\nProcess:\n- All contractors are pre-qualified through background, insurance and safety record checks.\n- Contractors receive site-specific safety induction and must sign a contractor safety declaration.\n- Contractor scope of work and safety plan is reviewed with the site manager before commencement.\n- Contractors must conform to all applicable site rules, HSE standards and local laws.\n- Contractors may be required to bring their own competent supervision and their own risks are managed under their own management system."
    }
  ];
  return policies.map((p) => ({
    id: newId("hse-policy"),
    title: p.title,
    category: p.category,
    version: "1.0",
    effectiveDate: nowIso().slice(0, 10),
    status: "draft" as const,
    verified: false,
    downloadable: false,
    documentUrl: "",
    content: p.content
  }));
}

function seedGovernanceDocs(): GovernanceDocument[] {
  const docs: Array<{ title: string; category: string; content: string }> = [
    {
      title: "Code of Conduct",
      category: "Code of conduct",
      content:
        "Adalia OIL AND GAS LTD expects every employee, contractor, supplier and partner to uphold the highest standards of personal and professional conduct.\n\nExpectations:\n- Act with integrity and honesty in all business and operational activities.\n- Respect colleagues, communities, regulators and all stakeholders.\n- Comply with all applicable laws and regulations.\n- Avoid conflicts of interest and disclose them when they arise.\n- Maintain confidentiality of all company information that is not intended for public disclosure.\n\nSanctions:\nNon-compliance may result in discipline up to and including termination of employment or contractual relationship."
    },
    {
      title: "Anti-Bribery and Anti-Corruption Policy",
      category: "Anti-bribery and anti-corruption policy",
      content:
        "Adalia OIL AND GAS LTD does not tolerate bribery, corruption or any form of facilitation payment.\n\nStandards:\n- Never offer, promise or make any payment that is intended to influence the decision of a public official or any person in a position of authority.\n- Never accept any form of gift, entertainment, loan or advantage that is offered or received as an inducement in business transactions.\n- All expenditure must follow approved internal procedures and procurement policies.\n\nCompliance:\nThe entire workforce and contractors must comply with this policy. Any breach must be reported through the whistleblowing procedure. Adalia may report to the International Anti-Corruption Coordinating Group (IACCG), the ICACR, the ICJ and the EFCC as required by law and regulation."
    },
    {
      title: "Conflict of Interest Policy",
      category: "Conflict of interest policy",
      content:
        "Adalia OIL AND GAS LTD requires every employee, contractor, director and partner to act independently and act in the best interests of the company.\n\nExamples of a conflict of interest include:\n- Benefits derived from third parties that may affect a decision (e.g. shell companies).\n- Engagement or investments in other organisations that compete with or substantially affect the company.\n- Ability to access confidential company information due to personal relationships.\n\nProcess:\nIf a conflict exists, the person must disclose it to management or the Board within a set timeframe. Disclosures do not disqualify a person if the conflict is not managed or resolved. Management decides if a person continues to participate. This process continues if there is a discrepancy between what the person tells Adalia and what is reported to Adalia in connection with fluctuating international currency rates or event-based time schedules."
    },
    {
      title: "Ethical Business Practices",
      category: "Ethical business practices",
      content:
        "Adalia OIL AND GAS LTD is committed to fair, honest and ethical business practices.\n\nStandards:\n- Honest communication and transparency in all business deals.\n- Fair treatment of all stakeholders: employees, contractors, clients, partners and communities.\n- Ethical conduct by all employees, including timely and honest completion of performance reviews.\n- Respect for human rights in operations and supply chains.\n- Responsible and constructive behaviour during any dispute or uncertainty."
    },
    {
      title: "Whistleblowing and Reporting Procedure",
      category: "Whistleblowing and reporting procedure",
      content:
        "Any employee, contractor or associate who believes there has been a serious violation of the Code of Conduct or anti-corruption policy is encouraged to report it.\n\nReporting channels (all treated as confidential where possible):\n- Direct to management and the Board of Directors through established channels.\n- Reporting to the International Anti-Corruption Coordinating Group (IACCG), the ICACR, the ICJ or the EFCC as required by law.\n- Anonymous hotlines and email addresses where available.\n\nGuarantees:\nAdalia prohibits retaliation against anyone in good faith who raises concerns. All reports are reviewed confidentially and professionally. The identity of the reporter will not be disclosed unless legally required."
    },
    {
      title: "Supplier and Contractor Conduct Requirements",
      category: "Supplier and contractor conduct requirements",
      content:
        "Suppliers and contractors to Adalia must uphold the same standards of integrity, safety and ethics as our own team.\n\nRequirements:\n- Ensure supplies and services comply with applicable laws and regulations.\n- Keep accurate records of invoices and receipts and support genuine quotation documents.\n- Comply with payment terms and process all invoices correctly and without delay.\n- Treat suppliers and end clients with respect and value their business.\n- Promptly report any breach of law or ethical standards that affects Adalia.\n\nExpectations:\nSuppliers and contractors must demonstrate a track record of honesty and reliability, including compliance with applicable tax obligations, return for unsold goods, correct invoices, warranties, return policies and cost constraints."
    },
    {
      title: "Corporate Responsibility",
      category: "Corporate responsibility",
      content:
        "Adalia OIL AND GAS LTD is committed to contributing positively to the communities and regions we operate in.\n\nInitiatives:\n- Respect and protection of human rights, in line with UN Guiding Principles on Business and Human Rights.\n- Contributions to the development of communities where we operate.\n- Partnership with relevant stakeholders including local government agencies, community leaders and local industry bodies.\n- Continued investment in skills development, training and CSR programmes.\n- Promotion of the use of local colours, local logistics and local cryogenics for the use of local resources.\n\nObjective: Adalia considers corporate responsibility part of our sustainable growth strategy and long-term success.\n\nLimit: The company will review and revise this policy periodically to ensure it meets changes in internal, legal and social factors."
    }
  ];
  return docs.map((d) => ({
    id: newId("gov-doc"),
    title: d.title,
    category: d.category,
    version: "1.0",
    effectiveDate: null,
    status: "draft" as const,
    verified: false,
    documentUrl: "",
    content: d.content
  }));
}

function seedServices(): ServiceRecord[] {
  const services: ServiceRecord[] = [];
  for (const division of divisions) {
    for (const title of division.services) {
      services.push({
        id: newId("svc"),
        title,
        division: division.slug,
        description: `${title} under the ${division.title} division of ADALIA OIL AND GAS LTD.`,
        objectives: ["Operational excellence through technical competence and quality delivery."],
        capabilities: ["Qualified personnel and equipment", "Compliance with applicable safety and quality standards"],
        image: division.image,
        verified: true
      });
    }
  }
  return services;
}

let cachedSettings: Settings | null = null;

export function seedSettings(): Settings {
  return {
    version: 1,
    company: seedCompany(),
    services: seedServices(),
    projects: [],
    compliance: seedCompliance(),
    hsePolicies: seedHsePolicies(),
    governanceDocs: seedGovernanceDocs(),
    supplierRegistrations: [],
    enquiries: [],
    activity: []
  };
}

export function loadSettings(): Settings {
  if (cachedSettings) return cachedSettings;
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
      const parsed = JSON.parse(raw) as Settings;
      cachedSettings = normalizeSettings(parsed);
    } catch (error) {
      console.error("[Settings] Failed to parse settings file, reseeding", error);
      cachedSettings = seedSettings();
    }
  } else {
    cachedSettings = seedSettings();
  }
  return cachedSettings;
}

function normalizeSettings(s: Settings): Settings {
  return {
    version: typeof s.version === "number" ? s.version : 1,
    company: s.company ?? seedCompany(),
    services: Array.isArray(s.services) ? s.services : [],
    projects: Array.isArray(s.projects) ? s.projects : [],
    compliance: Array.isArray(s.compliance) ? s.compliance : [],
    hsePolicies: Array.isArray(s.hsePolicies) ? s.hsePolicies : [],
    governanceDocs: Array.isArray(s.governanceDocs) ? s.governanceDocs : [],
    supplierRegistrations: Array.isArray(s.supplierRegistrations) ? s.supplierRegistrations : [],
    enquiries: Array.isArray(s.enquiries) ? s.enquiries : [],
    activity: Array.isArray(s.activity) ? s.activity : []
  };
}

export function saveSettings(settings: Settings): void {
  cachedSettings = settings;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${SETTINGS_FILE}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(settings, null, 2), "utf8");
    fs.renameSync(tmp, SETTINGS_FILE);
  } catch (error) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw error;
  }
}

export function logActivity(action: string, detail: string): void {
  const settings = loadSettings();
  const entry: ActivityLogEntry = { id: newId("act"), at: nowIso(), action, detail };
  settings.activity = [entry, ...settings.activity].slice(0, 200);
  saveSettings(settings);
}

export function getCompanySettings(): CompanyProfile {
  return loadSettings().company;
}

export function getServices(): ServiceRecord[] {
  return loadSettings().services;
}

export function getProjects(): ProjectRecord[] {
  return loadSettings().projects;
}

export function getComplianceCertificates(): ComplianceCertificate[] {
  return loadSettings().compliance;
}

export function getComplianceByCategory(): Record<string, ComplianceCertificate[]> {
  const byCategory: Record<string, ComplianceCertificate[]> = {};
  for (const cert of getComplianceCertificates()) {
    (byCategory[cert.category] ??= []).push(cert);
  }
  return byCategory;
}

export function getCertificatesExpiringSoon(days = 90): ComplianceCertificate[] {
  const settings = loadSettings();
  const horizon = Date.parse(new Date().toISOString().slice(0, 10) + "T00:00:00Z") + days * 86_400_000;
  return settings.compliance.filter((c) => {
    if (!c.expiryDate) return false;
    return Date.parse(c.expiryDate) <= horizon && Date.parse(c.expiryDate) > Date.now();
  });
}

export function getHsePolicies(): HsePolicyDocument[] {
  return loadSettings().hsePolicies;
}

export function getGovernanceDocs(): GovernanceDocument[] {
  return loadSettings().governanceDocs;
}

export function getSupplierRegistrations(): SupplierRegistration[] {
  return loadSettings().supplierRegistrations;
}

export function getEnquiries(): EnquiryRecord[] {
  return loadSettings().enquiries;
}

export function getActivity(): ActivityLogEntry[] {
  return loadSettings().activity;
}

export function mutateSettings(mutator: (settings: Settings) => void): Settings {
  const settings = loadSettings();
  mutator(settings);
  saveSettings(settings);
  return settings;
}
