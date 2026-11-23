/**
 * Authoritative company profile.
 *
 * Rules:
 * - Every public field below is verifiable by the company itself. Fields that
 *   are not yet confirmed are stored empty and flagged `requiresVerification`.
 *   They are admin-editable via the admin dashboard (`/admin/company`) and are
 *   never shown as blank/placeholder text on public pages.
 * - Generic objective statements below are consistent with the existing
 *   mission text. They are not invented facts; they state the company's aims.
 */

export const coreValues = ["Safety First.", "Integrity", "Excellence", "Reliability", "Innovation."];

export interface CompanySocial {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

export const company = {
  name: "ADALIA OIL AND GAS LTD",
  slogan: "Driven by Excellence. Powering Energy.",
  foundation: "Built on faith, integrity and excellence.",
  website: "http://www.adaliaoilandgasltd.com",

  // Contact / registration fields. Empty until the company confirms them.
  address: "",
  phone: "",
  email: "",
  rcNumber: "",
  addressRequiresVerification: true,
  phoneRequiresVerification: true,
  emailRequiresVerification: true,
  rcNumberRequiresVerification: true,

  social: {
    whatsapp: "https://wa.me/?text=I%20would%20like%20to%20enquire%20about%20Adalia%20Oil%20and%20Gas%20Ltd",
    instagram: "https://www.instagram.com/adaliaoilandgasltd/",
    facebook: "https://www.facebook.com/adaliaoilandgasltd/"
  },

  about:
    "Adalia Oil and Gas Ltd is a full-capacity indigenous energy group operating across the entire oil and gas value chain - from drilling to crude lifting, gas and petroleum distribution.",
  about2:
    "We deliver safe, reliable and world-class energy solutions to clients in Nigeria and international markets, with a strong focus on quality, transparency and timely delivery.",
  aboutLong: [
    "Our story is one of steady growth built on faith, integrity and an unwavering commitment to excellence. From a focused service provider, Adalia has grown into a full-capacity indigenous energy group able to support clients across the entire oil and gas value chain - from the first borehole to the final delivery of petroleum products to market.",
    "We work through four complementary divisions. Adalia Drilling Services supports onshore and offshore drilling programmes with well drilling, completion and workover, intervention and testing, equipment supply and mud logging. Adalia Crude Lifting, Marine & Logistics moves crude from production facilities to terminals and international markets through lifting, evacuation, vessel chartering, offshore supply and storage operations.",
    "Adalia Gas supplies LPG, CNG and LNG for industrial, commercial and domestic applications, alongside gas plant installation and maintenance, filling, reticulation and pipeline support. Adalia Petroleum Supply procures and distributes PMS, AGO, DPK, base oil and lubricants through bulk supply and nationwide distribution.",
    "That breadth allows us to serve as a single, accountable partner. Instead of coordinating several separate contractors, clients can rely on one group with the technical depth, logistical reach and commercial discipline to deliver integrated solutions - safely, on time and at competitive prices.",
    "Safety and responsibility are built into the way we operate. Our health, safety and environment commitment applies to every division: safe handling, safe transportation and environmentally responsible operations, supported by risk management, personnel protection and continuous operational excellence. We invest in our people and maintain a culture in which every team member is empowered to stop any task that is not safe.",
    "We are equally committed to the communities and partners we work with. As an indigenous group, we prioritise local participation, transparent dealings and lasting value for host communities. We welcome strategic partnerships with local and international organisations that share our standards and our long-term view of the energy industry.",
    "Looking ahead, Adalia continues to build capacity, deepen expertise and widen its reach. Our ambition is to remain a trusted African energy group - transforming the industry through excellence, innovation and sustainable growth while powering the communities and economies we serve."
  ],
  vision:
    "To be a leading African energy group, transforming the oil and gas industry through excellence, innovation and sustainable growth.",
  mission:
    "To deliver world-class drilling, crude lifting, gas and petroleum services - safely, on time and at competitive prices - while creating lasting value for our clients, partners and host communities.",
  hse:
    "At Adalia, safety is our first priority. We operate in line with international HSE standards, ensuring safe handling, safe transportation and environmentally responsible operations across all our divisions.",
  objectives: [
    "To deliver safe, reliable and world-class energy solutions across the oil and gas value chain.",
    "To maintain an organisational culture of integrity, excellence and innovation, with safety and quality prioritised in every operation.",
    "To build long-term value for our clients, partners and host communities through technical depth, operational discipline and transparent dealing.",
    "To invest in our workforce, capacity and the communities we serve so the group grows sustainably."
  ],
  management: [] as Array<{ name: string; title: string; bio: string; linkedin?: string; verified: boolean }>,
  coreValues
};

export const divisions = [
  {
    slug: "drilling-services",
    title: "ADALIA DRILLING SERVICES",
    short: "Professional onshore and offshore drilling support and technical services.",
    image: "/images/workspace.jpg",
    services: [
      "Onshore and Offshore Drilling Support.",
      "Well Drilling, Completion and Workover.",
      "Well Intervention and Well Testing.",
      "Drilling Equipment Supply and Maintenance.",
      "Mud Logging and Technical Support."
    ]
  },
  {
    slug: "crude-lifting-marine-logistics",
    title: "ADALIA CRUDE LIFTING, MARINE & LOGISTICS",
    short:
      "Integrated crude oil lifting, marine transportation and logistics solutions connecting oil production facilities, terminals and international markets.",
    image: "/images/Rigs.jpg",
    services: [
      "Crude Oil Lifting and Trading.",
      "Crude Evacuation and Transportation to Any Location.",
      "Vessel Chartering and Marine Support.",
      "Marine Logistics and Offshore Supply.",
      "Storage and Terminal Operations."
    ]
  },
  {
    slug: "gas",
    title: "ADALIA GAS",
    short:
      "Reliable gas supply, distribution, infrastructure and energy solutions for industrial, commercial and domestic applications.",
    image: "/images/Pipes.jpg",
    services: [
      "LPG Supply and Distribution.",
      "CNG Supply for Vehicles and Industries.",
      "LNG Supply and Logistics.",
      "Gas Plant Installation and Maintenance.",
      "Gas Filling, Reticulation and Pipeline Support.",
      "Gas Trading and Marketing."
    ]
  },
  {
    slug: "petroleum-supply",
    title: "ADALIA PETROLEUM SUPPLY",
    short:
      "Dependable petroleum product procurement, bulk supply and distribution services.",
    image: "/images/Distributing Tank.jpg",
    services: [
      "PMS, AGO, DPK, Base Oil and Lubricants.",
      "Bulk Supply and Nationwide Distribution.",
      "Procurement and Logistics Support."
    ]
  }
];

export const whyChoose = [
  "Full Capacity in One Group - Drilling, Lifting, Gas and Petroleum.",
  "Experienced Technical Team.",
  "Strong Safety and Quality Culture.",
  "Fast Mobilization and Reliable Delivery.",
  "Transparent and Trusted Business Dealings.",
  "Ready for Local and International Partnerships."
];

export const faqs = [
  {
    q: "What is Adalia Oil and Gas Ltd?",
    a: "Adalia Oil and Gas Ltd is a full-capacity indigenous energy group operating across the entire oil and gas value chain - from drilling to crude lifting, gas and petroleum distribution, delivering safe, reliable and world-class energy solutions to clients in Nigeria and international markets."
  },
  {
    q: "What services does the company offer?",
    a: "We operate through four divisions: Adalia Drilling Services; Adalia Crude Lifting, Marine & Logistics; Adalia Gas; and Adalia Petroleum Supply, covering drilling support, crude lifting and marine logistics, gas supply and infrastructure, and petroleum procurement and distribution."
  },
  {
    q: "Does Adalia provide offshore drilling support?",
    a: "Yes. Adalia Drilling Services provides onshore and offshore drilling support, including well drilling, completion and workover, well intervention and testing, equipment supply and maintenance, and mud logging and technical support."
  },
  {
    q: "Does Adalia handle crude oil lifting?",
    a: "Yes. Through Adalia Crude Lifting, Marine & Logistics, we provide crude oil lifting and trading, crude evacuation and transportation to any location, vessel chartering and marine support, marine logistics and offshore supply, and storage and terminal operations."
  },
  {
    q: "Does Adalia offer vessel chartering?",
    a: "Yes. Vessel chartering and marine support are part of our crude lifting, marine and logistics services."
  },
  {
    q: "What gas products does Adalia supply?",
    a: "Adalia Gas provides LPG supply and distribution, CNG supply for vehicles and industries, and LNG supply and logistics, along with gas plant installation and maintenance, gas filling, reticulation and pipeline support, and gas trading and marketing."
  },
  {
    q: "Does Adalia provide nationwide petroleum distribution?",
    a: "Yes. Adalia Petroleum Supply offers bulk supply and nationwide distribution of PMS, AGO, DPK, base oil and lubricants, along with procurement and logistics support."
  },
  {
    q: "How can companies establish a partnership with Adalia?",
    a: "Companies interested in strategic partnerships can contact our team through the website contact form, selecting 'Strategic Partnership' as the division of interest, or reach out using the contact details provided on our Contact page."
  },
  {
    q: "How can I request a quotation?",
    a: "You can request a quotation by using the 'Request a Consultation' button or the contact form on our website and selecting the relevant division of interest. Our team will respond with clarification and next steps."
  },
  {
    q: "How can I contact Adalia?",
    a: "You can contact us via our website, by phone or by email when published on this site, or by visiting our registered office address after confirmation."
  }
];
