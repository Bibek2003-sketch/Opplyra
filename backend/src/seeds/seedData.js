/**
 * Opplyra Seed Data
 * Clearly labelled demonstration records for hackathon showcase.
 * Real-world realistic programs with transparent dummy indicators.
 */

const sampleOpportunities = [
  {
    title: "National Merit Post-Matric STEM Scholarship 2026",
    organization: "Ministry of Education & Science Council",
    category: "Scholarships",
    type: "Government Merit-cum-Means",
    shortDescription:
      "Merit-based financial grant supporting undergraduate students in STEM courses across recognized Indian universities.",
    fullDescription:
      "The National Merit Post-Matric STEM Scholarship aims to empower talented students pursuing technical education. It offers full tuition fee reimbursement and an annual maintenance allowance. Beneficiaries are selected based on academic performance in prior qualifying examinations and verified family income thresholds under 6.0 LPA.",
    eligibilitySummary:
      "1st or 2nd Year B.Tech/B.Sc STEM students with >= 7.5 CGPA and family income < ₹6 LPA.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "B.Sc",
        "Computer Science",
        "Engineering",
        "Data Science",
        "Electronics",
      ],
      academicYearsAllowed: ["1st Year", "2nd Year"],
      minimumCgpa: 7.5,
      locationsAllowed: ["Pan-India"],
      genderPreference: "All",
      ageLimitMax: 24,
      incomeCeiling: "₹6,00,000 per annum",
    },
    requiredDocuments: [
      "Current Semester Grade Sheet / Marksheet",
      "College Identity Card & Bonafide Certificate",
      "Income Certificate from Competent Revenue Authority",
      "Aadhaar-linked Bank Passbook copy",
    ],
    stipendOrAward: "₹50,000 / year + Tuition Reimbursement",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    sourceUrl: "https://scholarships.gov.in/demo/national-stem-2026",
    sourceTimestamp: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["STEM", "Merit-Cum-Means", "Undergraduate", "Government"],
  },
  {
    title: "Google Student Research Fellow Internship - Summer 2026",
    organization: "Google Research Labs India",
    category: "Internships",
    type: "Corporate Research",
    shortDescription:
      "12-week intensive summer fellowship working on applied machine learning, distributed systems, and natural language processing.",
    fullDescription:
      "The Research Fellow program is a competitive opportunity for undergraduate and master's students eager to build scalable AI/ML solutions. Fellows will collaborate with senior staff researchers and software engineers to design algorithms and publish peer-reviewed papers.",
    eligibilitySummary:
      "3rd or 4th Year B.Tech, M.Tech, or MS in CS/Data Science with strong coding in Python/C++.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "MS",
        "Computer Science",
        "Information Technology",
        "AI/ML",
      ],
      academicYearsAllowed: ["3rd Year", "4th Year", "Postgraduate"],
      minimumCgpa: 8.0,
      locationsAllowed: ["Pan-India", "Bengaluru", "Hyderabad"],
      genderPreference: "All",
      ageLimitMax: 26,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "Updated Curriculum Vitae (CV) with GitHub/Portfolio",
      "Official University Transcript",
      "Statement of Purpose (500 words on ML interest)",
      "Letter of Recommendation from Faculty",
    ],
    stipendOrAward: "₹85,000 / month + Relocation Support",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    sourceUrl: "https://careers.google.com/students/research-fellow-2026-demo",
    sourceTimestamp: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Machine Learning", "Research", "Top Tech", "High Stipend"],
  },
  {
    title: "ISRO Space Systems Graduate Apprentice Trainee 2026",
    organization: "Indian Space Research Organisation (ISRO)",
    category: "Jobs & Training",
    type: "Public Sector Apprentice",
    shortDescription:
      "One-year paid technical apprenticeship for fresh engineering graduates in satellite communications and propulsion.",
    fullDescription:
      "ISRO centres invite online applications from eligible engineering and technology graduates for engagement as Graduate Apprentice Trainees under the Apprentices Act. Training will provide hands-on experience in aerospace payload integration, avionics telemetry, and environmental testing labs.",
    eligibilitySummary:
      "Final year B.Tech or recent graduates (2025/2026 batch) in Aerospace, Mechanical, ECE, or CS with >= 65% aggregate.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "Mechanical",
        "ECE",
        "Aerospace",
        "Computer Science",
        "Electronics",
      ],
      academicYearsAllowed: ["4th Year", "Graduates"],
      minimumCgpa: 6.5,
      locationsAllowed: ["Pan-India", "Bengaluru", "Thiruvananthapuram"],
      genderPreference: "All",
      ageLimitMax: 28,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "Provisional Degree Certificate or Course Completion Certificate",
      "Consolidated Marksheet of all Semesters",
      "Proof of Age (10th Standard Certificate)",
      "NATS Portal Student Registration Number",
    ],
    stipendOrAward: "₹18,500 / month (Stipend as per Apprenticeship Norms)",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    sourceUrl: "https://www.isro.gov.in/careers/apprentice-2026-demo",
    sourceTimestamp: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Aerospace", "Apprenticeship", "ISRO", "Government"],
  },
  {
    title:
      "Graduate Aptitude Test in Engineering (GATE) 2027 Early Registration",
    organization: "National Coordination Board & IIT Council",
    category: "Competitive Examinations",
    type: "National Competitive Exam",
    shortDescription:
      "Premier national-level examination testing comprehensive understanding of undergraduate engineering subjects for PSU recruitment & M.Tech admissions.",
    fullDescription:
      "GATE is jointly conducted by IISc and seven IITs on behalf of the National Coordination Board. Scorecards are valid for three years and utilized by major public sector enterprises (IOCL, NTPC, ONGC, BHEL, DRDO) for direct engineering executive hiring, as well as IIT/IISc master's and doctoral program admissions.",
    eligibilitySummary:
      "Pre-final & Final year students currently pursuing B.Tech/B.Arch/M.Sc or completed.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "B.Arch",
        "B.Sc",
        "M.Sc",
        "MCA",
        "Engineering",
      ],
      academicYearsAllowed: [
        "3rd Year",
        "4th Year",
        "Graduates",
        "Postgraduate",
      ],
      minimumCgpa: 5.5,
      locationsAllowed: ["Pan-India"],
      genderPreference: "All",
      ageLimitMax: null,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "Valid Government Photo ID (Aadhaar / Passport / Voter ID)",
      "Certificate from Head of Department for pre-final year students",
      "Passport size photograph with white background",
      "Category Certificate (if claiming fee concession / reservation)",
    ],
    stipendOrAward:
      "PSU Direct Hiring (₹12-20 LPA) & MHRD M.Tech Fellowship (₹12,400/mo)",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    sourceUrl: "https://gate2027.iit.ac.in/demo-portal",
    sourceTimestamp: new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["GATE", "IIT", "PSU Hiring", "Master's Admission"],
  },
  {
    title: "Women in Technology & AI Fellowship 2026",
    organization: "Grace Hopper Foundation & Tech Consortium",
    category: "Scholarships",
    type: "Diversity & Merit Grant",
    shortDescription:
      "Empowering female undergraduate engineers with financial stipends, 1-on-1 industry mentorship, and direct conference sponsorship.",
    fullDescription:
      "The Women in Technology & AI Fellowship champions female innovators pursuing computing disciplines. Fellows receive direct financial grants, access to closed executive mentorship circles from Fortune 500 tech leaders, and sponsored attendance to international technology symposiums.",
    eligibilitySummary:
      "Female students enrolled in 2nd, 3rd, or 4th Year of undergraduate computer science or IT.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "BCA",
        "B.Sc Computer Science",
        "Information Technology",
        "AI/ML",
      ],
      academicYearsAllowed: ["2nd Year", "3rd Year", "4th Year"],
      minimumCgpa: 7.0,
      locationsAllowed: ["Pan-India"],
      genderPreference: "Female",
      ageLimitMax: 25,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "College Enrollment Proof",
      "Academic Transcripts",
      "GitHub profile or technical project portfolio link",
      "Short video response or essay on diversity in tech",
    ],
    stipendOrAward: "₹75,000 One-time Grant + Laptop Allowance",
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
    sourceUrl: "https://womenintechfellows.org/apply-2026-demo",
    sourceTimestamp: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Diversity", "Women in Tech", "Mentorship", "Grants"],
  },
  {
    title: "Microsoft Cloud & Systems Software Engineering Internship",
    organization: "Microsoft India Development Center",
    category: "Internships",
    type: "Industry Internship",
    shortDescription:
      "6-month internship focused on Azure cloud infrastructure, high-concurrency storage engines, and developer productivity tools.",
    fullDescription:
      "Join engineering teams tackling planetary-scale computational challenges. As a Software Engineering Intern, you will write clean, well-tested production code, participate in design reviews, and deploy microservices affecting millions of enterprise users worldwide.",
    eligibilitySummary:
      "Pre-final year B.Tech/Dual degree students in Computer Science, IT, or allied branches.",
    eligibilityCriteria: {
      coursesAllowed: [
        "B.Tech",
        "B.E.",
        "Dual Degree",
        "Computer Science",
        "Information Technology",
        "Mathematics & Computing",
      ],
      academicYearsAllowed: ["3rd Year"],
      minimumCgpa: 7.8,
      locationsAllowed: ["Pan-India", "Hyderabad", "Noida", "Bengaluru"],
      genderPreference: "All",
      ageLimitMax: 24,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "Technical Resume",
      "Degree Progress Transcript",
      "Links to competitive programming handles (LeetCode/Codeforces)",
    ],
    stipendOrAward: "₹1,00,000 / month + Housing Stipend",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now (urgent deadline)
    sourceUrl: "https://careers.microsoft.com/in/students/swe-intern-demo",
    sourceTimestamp: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Cloud", "Systems", "High Stipend", "Software Engineering"],
  },
  {
    title: "RBI Grade B Officers Examination 2026",
    organization: "Reserve Bank of India Services Board",
    category: "Competitive Examinations",
    type: "Central Banking Recruitment",
    shortDescription:
      "Direct recruitment of Officers in Grade 'B' (General, DEPR, and DSIM) across India's central bank.",
    fullDescription:
      "The Reserve Bank of India Services Board conducts this prestigious nationwide recruitment in three phases: Phase I Online Objective Test, Phase II Descriptive & Economic Policy Paper, and Final Personal Interview. Selected officers play a direct role in monetary policy formulation and financial supervision.",
    eligibilitySummary:
      "Graduates with minimum 60% marks in any discipline, age between 21 and 30 years.",
    eligibilityCriteria: {
      coursesAllowed: [
        "All UG",
        "B.Tech",
        "B.Com",
        "B.Sc",
        "B.A.",
        "Engineering",
        "Economics",
        "Graduates",
      ],
      academicYearsAllowed: ["Graduates"],
      minimumCgpa: 6.0,
      locationsAllowed: ["Pan-India"],
      genderPreference: "All",
      ageLimitMax: 30,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "Graduation Degree Certificate",
      "Category Certificate (if applicable)",
      "Photo Identity Proof (Voter ID, Passport, PAN Card)",
      "Experience certificates (if any)",
    ],
    stipendOrAward:
      "Starting Gross Emoluments ~₹1,16,684 / month + Bank Quarters",
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUrl: "https://opportunities.rbi.org.in/demo/grade-b-2026",
    sourceTimestamp: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Banking", "Officer Cadre", "Central Bank", "Government"],
  },
  {
    title: "Full-Stack Web & AI Developer Apprenticeship",
    organization: "National Skill Development Corporation (NSDC) & NASSCOM",
    category: "Jobs & Training",
    type: "Industry Skill Initiative",
    shortDescription:
      "Government-supported 9-month boot camp and apprenticeship with guaranteed interview placement drives in top tech startups.",
    fullDescription:
      "A specialized initiative designed to bridge the academic-industry gap. Trainees undergo 3 months of rigorous hands-on curriculum in modern JavaScript frameworks, cloud deployments, and generative AI prompt engineering, followed by 6 months of paid placement with partner companies.",
    eligibilitySummary:
      "Final year students or recent graduates from any recognized degree or diploma program.",
    eligibilityCriteria: {
      coursesAllowed: [
        "All UG",
        "B.Tech",
        "BCA",
        "B.Sc",
        "Diploma in CS/IT",
        "Engineering",
      ],
      academicYearsAllowed: ["3rd Year", "4th Year", "Graduates"],
      minimumCgpa: 5.0,
      locationsAllowed: ["Pan-India", "Hybrid"],
      genderPreference: "All",
      ageLimitMax: 27,
      incomeCeiling: "None",
    },
    requiredDocuments: [
      "College Identity Card or Degree Certificate",
      "Aadhaar Card",
      "Self-declaration of basic computer literacy",
    ],
    stipendOrAward:
      "₹15,000 / month during training, full-time offers from ₹4.5 to 8 LPA",
    deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    sourceUrl: "https://nsdcindia.org/demo/tech-apprentice-2026",
    sourceTimestamp: new Date(
      Date.now() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isDemonstration: true,
    tags: ["Full Stack", "NSDC", "Placement", "Skill India"],
  },
];

module.exports = {
  sampleOpportunities,
};
