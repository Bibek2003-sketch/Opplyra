/**
 * Opplyra Curated Fraud Pattern Dataset
 * Version: 2.0.0
 * 
 * Versioned, comprehensive rule definitions for detecting student-targeted opportunity fraud.
 * Organised into modular semantic categories:
 * - A: Advance-Fee Fraud (Scholarships, Jobs, Deposits, Awards, Offer Letters, UPI Demands)
 * - B: Credential & Banking Theft (OTPs, PINs, Passwords, Payment Cards, Sensitive Documents)
 * - C: Fake Jobs & Internships (Unrealistic Earnings, No-Interview Direct Hiring, Certificate Sales)
 * - D: Impersonation & High-Pressure Tactics (Messaging Apps, Personal Webmail, Deadlines, Secrecy, APKs)
 * - E: Benign Negations & Educational Discussion Patterns
 */

const DATASET_VERSION = '2.0.0';
const LAST_REVIEWED = '2026-10-29';

const FRAUD_CATEGORIES = {
  ADVANCE_FEE: 'Advance-Fee Fraud',
  CREDENTIAL_THEFT: 'Credential & Banking Theft',
  FAKE_OFFER: 'Fake Job & Internship Offer',
  IMPERSONATION_URGENCY: 'Impersonation & Coercive Pressure',
  MALICIOUS_SOFTWARE: 'Malicious App or Remote Access',
  URL_RISK: 'Suspicious Website or Domain Structure',
  EDUCATIONAL_DISCUSSION: 'Educational Discussion / Benign Warning',
};

const RISK_WEIGHTS = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 8,
};

// Curated Pattern Definitions
const PATTERNS = [
  // =========================================================================
  // CATEGORY A: Advance-Fee Fraud
  // =========================================================================

  // A1. Scholarship Processing / Sanction / Release Fee
  {
    id: 'ADVANCE_FEE_SCHOLARSHIP_RELEASE',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Fee Demanded to Release or Sanction Scholarship',
    explanation: 'Legitimate scholarships never ask students to pay a registration fee, clearance charge, or processing amount to release financial aid.',
    action: 'Do not pay any fee. Official scholarship programs disburse grants directly to verified institutions or student bank accounts at zero charge.',
    regex: /(?:(?:pay|deposit|transfer|send|require[sd]?)\s*(?:a\s*)?(?:refundable\s*)?(?:processing|registration|sanction|clearance|disbursement|verification|portal)?\s*(?:fee|charge|deposit|amount|cost)\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*[\d,]*\s*(?:to\s*(?:release|claim|unlock|sanction|disburse|receive|verify)\s*(?:your\s*)?(?:scholarship|grant|fellowship|financial\s*aid|award|funds?))|(?:scholarship|grant|fellowship)\s*.*?(?:refundable\s*)?(?:processing|registration|sanction|clearance|disbursement|portal)\s*(?:fee|charge|deposit|amount))/i,
  },

  // A2. Job Registration / Onboarding / ID Card / Training Kit Fee
  {
    id: 'ADVANCE_FEE_JOB_ONBOARDING',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Pre-Employment Registration or Equipment Fee Demand',
    explanation: 'Demanding payments for job registration, onboarding, ID card creation, uniform, training kit, or laptop security before employment is a hallmark of recruitment fraud.',
    action: 'Do not pay. Genuine employers cover all onboarding, background verification, and equipment costs at zero expense to the student.',
    regex: /(?:(?:pay|deposit|transfer|make\s*payment|require[sd]?\s*(?:to\s*pay)?)\s*(?:a\s*)?(?:one-?time\s*)?(?:registration|onboarding|joining|application\s*processing|interview\s*slot|gate\s*pass|id\s*card|laptop|uniform|training\s*kit)\s*(?:fee|charge|deposit|cost|amount)|(?:registration|onboarding|joining)\s*(?:fee|charge)\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*[\d,]+|payment\s*for\s*(?:an?\s*)?(?:id\s*card|training\s*certificate|uniform|laptop\s*security)\s*before\s*joining)/i,
  },

  // A3. Refundable Security / Caution Deposit
  {
    id: 'ADVANCE_FEE_REFUNDABLE_DEPOSIT',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Refundable Caution or Security Deposit Demand',
    explanation: 'Scammers promise that an upfront "caution deposit" or "security fee" will be refunded with your first salary or scholarship disbursement.',
    action: 'Never send a refundable deposit for an opportunity. Government entities, universities, and legitimate corporations never take security deposits.',
    regex: /(?:(?:refundable|caution)\s*(?:security\s*)?(?:deposit|fee|charge|amount|money|sum)|deposit\s*(?:a\s*)?(?:refundable\s*)?(?:security|caution)\s*(?:deposit|fee|amount|sum)\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*[\d,]*|deposit\s*(?:rs\.?|inr|₹)?\s*[\d,]+\s*(?:which|that)?\s*(?:will\s*be\s*refunded|refundable))/i,
  },

  // A4. Prize / Reward / Gift Courier or Clearance Charge
  {
    id: 'ADVANCE_FEE_PRIZE_RELEASE',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Payment Demanded to Release Prize or Education Reward',
    explanation: 'Demanding courier fees, shipping charges, or tax clearance to receive a promised student award, prize, or laptop is a common advance-fee scam.',
    action: 'Legitimate academic prizes or competition rewards never charge winners for delivery or processing.',
    regex: /(?:(?:pay|send|transfer|deposit)\s*.*?(?:shipping|courier|delivery|processing|clearance|handling)\s*(?:charges?|fee|cost)\s*.*?(?:to\s*release|to\s*claim|for)\s*(?:your\s*)?(?:prize|award|reward|gift|laptop)|(?:awarded|won|chosen\s*for|selected\s*for)\s*.*?(?:prize|reward|laptop|cash\s*prize)\s*.*?(?:pay|deposit|fee\s*(?:of|is)?\s*(?:rs\.?|inr|₹)?\s*[\d,]+))/i,
  },

  // A5. Unofficial Payment Gateway (UPI, GPay, QR, Crypto)
  {
    id: 'ADVANCE_FEE_UNOFFICIAL_UPI_WALLET',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Payment Request via Personal UPI, Scanner, or Mobile Wallet',
    explanation: 'Instructing candidates to transfer money using UPI IDs, Google Pay, PhonePe, Paytm, QR scanners, or personal handles rather than official gateway portals.',
    action: 'Never transfer funds via UPI or QR code for job appointments or scholarships. Legitimate exam or application fees are processed through authorized institutional gateways.',
    regex: /(?:(?:pay|send|transfer|deposit)\s*.*?(?:via|through|to|on)\s*(?:upi(?:\s*id)?|google\s*pay|gpay|phonepe|paytm|scanner|qr\s*code|crypto|bitcoin|usdt|vpa)|upi\s*id\s*:\s*[a-zA-Z0-9.\-_+]+@(?:upi|okhdfcbank|oksbi|okaxis|paytm|ybl)|transfer\s*.*?(?:application|registration|caution|joining|security)\s*(?:charges?|fee|amount)\s*to\s*upi)/i,
  },

  // A6. Payment to Obtain Offer / Appointment Letter
  {
    id: 'ADVANCE_FEE_OFFER_LETTER',
    category: FRAUD_CATEGORIES.ADVANCE_FEE,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Fee Demanded for Offer Letter or Interview Confirmation',
    explanation: 'Charging money to issue an appointment letter, book an interview schedule, or confirm candidate selection is fraudulent.',
    action: 'Authentic employment offer letters and interview slots are granted without fees.',
    regex: /(?:(?:pay|transfer|fee|charges?)\s*(?:of\s*)?(?:rs\.?|inr|₹)?\s*[\d,]*\s*(?:for\s*(?:interview\s*slot|gate\s*pass|offer\s*letter|joining\s*letter|appointment\s*letter)|to\s*(?:confirm|issue|receive)\s*(?:your\s*)?(?:job|seat|offer|joining|appointment\s*letter)))/i,
  },

  // =========================================================================
  // CATEGORY B: Credential Theft & Sensitive Information
  // =========================================================================

  // B1. Bank OTP, ATM PIN, or UPI PIN Theft
  {
    id: 'CREDENTIAL_OTP_PIN_THEFT',
    category: FRAUD_CATEGORIES.CREDENTIAL_THEFT,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Request for Bank OTP, One-Time Password, or ATM PIN',
    explanation: 'The announcement or form requests your one-time password (OTP), bank verification code, or ATM/UPI PIN. No legitimate scholarship or employer will ever ask for this.',
    action: 'NEVER share OTPs or PINs with anyone. Doing so allows attackers to drain your bank account or take over your digital identity.',
    regex: /(?:(?:share|enter|send|provide|give|submit|verify\s*with)\s*(?:your\s*)?(?:bank\s*|6-digit\s*|aadhaar\s*)?(?:otp|one\s*time\s*password|atm\s*pin|upi\s*pin|mpin)|(?:bank\s*otp|atm\s*pin|upi\s*pin)\s*(?:and|with|to)\s*(?:verify|confirm|receive|release))/i,
  },

  // B2. Password / Account Login Theft
  {
    id: 'CREDENTIAL_PASSWORD_THEFT',
    category: FRAUD_CATEGORIES.CREDENTIAL_THEFT,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Request for Account, Email, or Banking Password',
    explanation: 'Requesting email passwords, net banking passwords, or personal account credentials to "verify" or "activate" a student profile is an immediate sign of credential harvesting.',
    action: 'Never enter or share passwords for your email or bank account. Third-party portals should only ever ask for their own distinct account registration password.',
    regex: /(?:(?:share|enter|send|provide|give|submit|verify\s*with)\s*(?:your\s*)?(?:email\s*password|account\s*(?:login\s*)?password|portal\s*password|net\s*banking\s*(?:login\s*)?password|banking\s*password)|email\s*address\s*and\s*email\s*password)/i,
  },

  // B3. Payment Card Details and CVV Collection
  {
    id: 'CREDENTIAL_CARD_CVV_THEFT',
    category: FRAUD_CATEGORIES.CREDENTIAL_THEFT,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Card Number and CVV Collection for "Verification"',
    explanation: 'Asking students for debit or credit card 16-digit numbers along with expiry date and CVV under the guise of applicant identity verification is fraudulent.',
    action: 'Student opportunity verification uses government photo IDs or student marks cards — never payment card numbers or CVVs.',
    regex: /(?:(?:card\s*number|debit\s*card|credit\s*card|bank\s*card)\s*.*?(?:cvv|cvc|security\s*code)|\bcvv\b\s*.*?(?:verify|verification|bank|aadhaar|card)|card\s*number\s*with\s*cvv)/i,
  },

  // B4. Demanding Sensitive Financial / Identity Documents in Unofficial Channels
  {
    id: 'CREDENTIAL_SENSITIVE_DOCS_DEMAND',
    category: FRAUD_CATEGORIES.CREDENTIAL_THEFT,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Request for Sensitive Identity Documents & Bank Details',
    explanation: 'Soliciting photos of Aadhaar cards, PAN cards, bank passbooks, or bank account numbers combined with personal messaging channels creates severe identity theft and financial fraud risks.',
    action: 'Only upload identity documents on HTTPS-encrypted, official portals of recognized educational or governmental institutions.',
    regex: /(?:(?:send|submit|share|upload|provide)\s*.*?(?:aadhaar\s*(?:card)?|pan\s*card|bank\s*passbook\s*(?:photo|copy)|passbook\s*copy|bank\s*account\s*number\s*(?:and|&)\s*ifsc|bank\s*details)\s*.*?(?:to\s*admin|to\s*hr|on\s*whatsapp|to\s*(?:the\s*)?group|via\s*email|to\s*activate))/i,
  },

  // =========================================================================
  // CATEGORY C: Fake Jobs & Internship Offers
  // =========================================================================

  // C1. Unrealistic Guaranteed Earnings
  {
    id: 'FAKE_JOB_UNREALISTIC_EARNINGS',
    category: FRAUD_CATEGORIES.FAKE_OFFER,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Unrealistic Daily or Weekly Guaranteed Earnings',
    explanation: 'Promising disproportionately high daily or weekly income (e.g. ₹5,000–₹8,000 daily) for unskilled tasks like typing, data entry, or captcha filling is typical of task scams.',
    action: 'Be deeply skeptical of "easy work from home" claims offering outsized daily payments; these invariably transition into demanding task-unlock fees.',
    regex: /(?:(?:earn|make|promising|earning\s*potential\s*of|daily\s*payout\s*of)\s*(?:rs\.?|inr|₹)?\s*(?:[\d,]+\s*(?:-|–|—|to)\s*(?:rs\.?|inr|₹)?\s*)?[\d,]+\s*(?:daily|per\s*day|hourly|per\s*week|weekly)|(?:earn|make)\s*(?:rs\.?|inr|₹)?\s*[\d,]+\s*daily\s*.*?(?:without\s*(?:any\s*)?(?:skills?|experience|qualification|effort)|data\s*entry|simple\s*typing))/i,
  },

  // C2. Guaranteed Selection / Direct Appointment Without Examination
  {
    id: 'FAKE_OFFER_NO_INTERVIEW_GUARANTEE',
    category: FRAUD_CATEGORIES.FAKE_OFFER,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: '100% Guaranteed Selection Without Exam or Interview',
    explanation: 'Promising direct appointment, 100% selection, or guaranteed placement without any testing, interview, or documented merit assessment is a signature employment fraud indicator.',
    action: 'All authentic government, public sector, and reputable corporate positions require merit screening, testing, or formal interviews.',
    regex: /(?:(?:100%|guaranteed)\s*(?:selection|placement|job|appointment|selection\s*guarantee|joining)|(?:selection|appointment|joining|recruitment|job\s*offer)\s*(?:without\s*(?:any\s*)?(?:exam|interview|test|written\s*test|assessment)|no\s*(?:exam|interview)\s*(?:needed|required))|direct\s*(?:appointment|joining|selection|recruitment)\s*.*?(?:without\s*(?:any\s*)?(?:exam|interview)|in\s*(?:railways?|bank|ministry|psu|metro)))/i,
  },

  // C3. Pay-to-Work Internship or Certificate Purchase
  {
    id: 'FAKE_INTERNSHIP_PAID_CERTIFICATE',
    category: FRAUD_CATEGORIES.FAKE_OFFER,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Pay-to-Work Internship or Fee for Certificate/ID Card',
    explanation: 'Requiring students to pay a fee to secure an internship, buy an internship certificate, or pay for training materials before joining is unethical and indicative of fraud.',
    action: 'Do not pay to work. Real internships either provide a stipend or offer free structured mentorship.',
    regex: /(?:buy\s*(?:verified\s*)?internship\s*certificate|internship\s*(?:fee|charge|deposit)\s*(?:of|is)?\s*[\d,]+|payment\s*for\s*(?:an?\s*)?(?:id\s*card|training\s*certificate|internship\s*certificate)|pay\s*.*?(?:for\s*)?(?:internship|training\s*certificate|id\s*card)\s*before\s*joining)/i,
  },

  // C4. Fake Internship Certificate Without Attendance or Work
  {
    id: 'FAKE_INTERNSHIP_NO_WORK_SOLD',
    category: FRAUD_CATEGORIES.FAKE_OFFER,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Internship Certificate Sold Without Attendance or Project Work',
    explanation: 'Offering verified completion certificates without attending classes, performing tasks, or completing evaluated project work constitutes credential fraud.',
    action: 'Never purchase certificates without performing the work. Submitting fraudulent certificates violates academic integrity codes and risks blacklisting.',
    regex: /(?:internship\s*certificate\s*without\s*(?:any\s*)?(?:attendance|doing\s*(?:any\s*)?work|project\s*work|classes?)|instant\s*certificate\s*without\s*internship|certificate\s*without\s*(?:doing\s*)?work|get\s*(?:a\s*)?(?:verified\s*)?internship\s*certificate\s*without\s*(?:attendance|work))/i,
  },

  // =========================================================================
  // CATEGORY D: Impersonation & Coercive Pressure
  // =========================================================================

  // D1. Recruitment via Unofficial Messaging Channels & Paid Group Access
  {
    id: 'IMPERSONATION_MESSAGING_APP_RECRUITMENT',
    category: FRAUD_CATEGORIES.IMPERSONATION_URGENCY,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Recruitment or Placement Exclusively via Messaging Group / Fee',
    explanation: 'Legitimate corporate and government recruiters do not conduct hiring through private WhatsApp or Telegram groups, nor do they charge entry fees to access job announcements.',
    action: 'Apply only through official corporate career portals or verified college placement cells.',
    regex: /(?:contact\s*.*?(?:only\s*)?on\s*whatsapp|join\s*.*?(?:whatsapp|telegram)\s*group\s*to\s*(?:apply|get\s*offer|get\s*job)|join\s*our\s*exclusive\s*.*?(?:placement|recruitment|job)\s*(?:whatsapp|telegram)\s*group|entry\s*fee\s*.*?(?:whatsapp|telegram)\s*group|pay\s*(?:an?\s*)?entry\s*fee\s*.*?(?:group|channel))/i,
  },

  // D2. Corporate / Government Recruitment Using Free Webmail
  {
    id: 'IMPERSONATION_PERSONAL_EMAIL_HIRING',
    category: FRAUD_CATEGORIES.IMPERSONATION_URGENCY,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Corporate or Government Hiring via Free Personal Webmail',
    explanation: 'The announcement claims to represent a recognized company or government agency but directs applications or resumes to a free personal webmail address (@gmail.com, @yahoo.com).',
    action: 'Official organizations communicate via authenticated domain emails (e.g., @tcs.com, @google.com, @isro.gov.in). Avoid sending personal resumes to unverified webmail addresses.',
    regex: /(?:(?:send\s*(?:your\s*)?(?:resume|cv|biodata|details)\s*to\s*|contact\s*|email\s*:?\s*|recruiter\.)[a-zA-Z0-9._%+-]+@(?:gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|rediffmail\.com))/i,
  },

  // D3. Artificial Urgency & Coercive Forfeiture Threats
  {
    id: 'URGENCY_ARTIFICIAL_PRESSURE',
    category: FRAUD_CATEGORIES.IMPERSONATION_URGENCY,
    severity: 'MEDIUM',
    weight: RISK_WEIGHTS.MEDIUM,
    name: 'Artificial Urgency and Immediate Forfeiture Threat',
    explanation: 'Imposing extreme time pressure (e.g. within 2 hours or before midnight) combined with threats that your seat or scholarship will be immediately cancelled aims to prevent thoughtful scrutiny.',
    action: 'Legitimate opportunities allow reasonable time to review terms and consult parents or academic advisors.',
    regex: /(?:(?:within\s*(?:1|2|3|4|6|12|24)\s*hours?|before\s*(?:midnight|today|5\s*pm))\s*(?:or|otherwise)\s*(?:seat\s*(?:cancelled|forfeited|offered)|offer\s*(?:withdrawn|cancelled)|disqualified|rejected|forfeit))/i,
  },

  // D4. Secrecy Demands or Legal Action Threats
  {
    id: 'URGENCY_SECRECY_LEGAL_THREAT',
    category: FRAUD_CATEGORIES.IMPERSONATION_URGENCY,
    severity: 'HIGH',
    weight: RISK_WEIGHTS.HIGH,
    name: 'Demand for Secrecy or Threat of Legal Action',
    explanation: 'Instructing students to keep an offer secret from parents or college authorities, or threatening police or legal action if money is not paid, is an extortion tactic.',
    action: 'Never keep opportunity details secret. Immediately inform college authorities and file a report with cybercrime.gov.in if threatened.',
    regex: /(?:strictly\s*confidential\s*do\s*not\s*disclose\s*to\s*(?:college|parents|friends|anyone)|legal\s*action\s*will\s*be\s*taken\s*if\s*(?:not\s*reported|not\s*paid))/i,
  },

  // D5. Sideloaded APK or Remote Access Software Request
  {
    id: 'MALICIOUS_APP_APK_DOWNLOAD',
    category: FRAUD_CATEGORIES.MALICIOUS_SOFTWARE,
    severity: 'CRITICAL',
    weight: RISK_WEIGHTS.CRITICAL,
    name: 'Request to Install Sideloaded APK or Remote Desktop App',
    explanation: 'Instructing candidates to download `.apk` files or install screen-sharing software (AnyDesk, TeamViewer, RustDesk) allows attackers to compromise your device and steal banking credentials.',
    action: 'NEVER install `.apk` files from messaging apps or install remote desktop software for an interview or exam.',
    regex: /(?:(?:download|install)\s*.*?(?:[a-zA-Z0-9_\-.]+\.apk|\.apk|apk\s*file|app\s*from\s*(?:telegram|whatsapp|link)|anydesk|teamviewer|rustdesk|quicksupport))/i,
  },
];

// Patterns for educational discussions or genuine warnings that should NOT be classified as scams
const BENIGN_AWARENESS_PATTERNS = [
  /(?:educational\s*(?:advisory|guidance|awareness|discussion|alert|bulletin)|student\s*awareness\s*notice)/i,
  /(?:how\s*to\s*(?:spot|identify|avoid|report)\s*(?:scams?|frauds?)|tips\s*to\s*protect\s*yourself|cyber\s*safety\s*tips?)/i,
  /(?:common\s*(?:student\s*)?(?:scam|fraud)\s*(?:tactics?|signs?|indicators?)|scammers?\s*(?:often|typically|usually)\s*(?:demand|ask|promise|target))/i,
];

// Explicit anti-fraud negation phrases used by legitimate organizations
const BENIGN_NEGATION_PATTERNS = [
  /(?:we\s*(?:do\s*not|never)\s*(?:ask\s*for|charge|collect|demand)\s*(?:any\s*)?(?:fees?|money|payment|deposits?))/i,
  /(?:isro\s*never\s*(?:collects?|charges?|asks?\s*for)\s*money)/i,
  /(?:beware\s*of\s*(?:fraudulent|fake|scam)\s*(?:agents?|calls?|websites?|emails?))/i,
  /(?:no\s*(?:application\s*fee|registration\s*fee|payment)\s*is\s*(?:required|needed|charged))/i,
  /(?:official\s*fee\s*(?:is\s*)?payable\s*only\s*through\s*(?:sbi\s*collect|official\s*gateway|portal))/i,
  /(?:candidates\s*are\s*advised\s*never\s*to\s*share\s*(?:otp|passwords?|credentials?))/i,
  /(?:recruitment\s*is\s*purely\s*on\s*merit\s*basis)/i,
];

module.exports = {
  DATASET_VERSION,
  LAST_REVIEWED,
  FRAUD_CATEGORIES,
  RISK_WEIGHTS,
  PATTERNS,
  BENIGN_AWARENESS_PATTERNS,
  BENIGN_NEGATION_PATTERNS,
};
