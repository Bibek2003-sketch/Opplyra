/**
 * Opplyra Curated Demonstration Example Library
 * 
 * Synthetic test announcements representing diverse student fraud vectors
 * and benign cases for interactive verification.
 * 
 * All synthetic examples are clearly labeled as demonstrations and are NOT
 * real-world incident records.
 */

const DEMONSTRATION_EXAMPLES = [
  {
    id: 'demo_advance_fee',
    label: 'Synthetic: Advance-Fee Job Scam',
    badge: 'Advance UPI Fee & Direct Appointment',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'http://railway-jobs-portal-direct.xyz/apply',
    text: 'DIRECT RECRUITMENT IN INDIAN RAILWAYS! 100% selection guaranteed without exam or interview. Selected candidate must pay a refundable laptop security deposit of Rs. 2,500 via Google Pay / UPI to HR Officer (+919876543210) before midnight or your seat will be cancelled and offered to waitlist candidates.',
    expectedOutcome: 'HIGH_RISK',
  },
  {
    id: 'demo_wfh_unrealistic',
    label: 'Synthetic: Fake Work-From-Home Offer',
    badge: 'Personal Gmail & Telegram Task Scam',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'https://careers-google-verify.blogspot.com',
    text: 'Urgent hiring for Google Data Entry & AI Work from Home. Earn Rs. 4,500 daily without any skills. Send your resume to recruiter.google.hiring2026@gmail.com and join our official Telegram group to apply. Only 3 seats left hurry!',
    expectedOutcome: 'HIGH_RISK',
  },
  {
    id: 'demo_credential_theft',
    label: 'Synthetic: Credential & OTP Theft Form',
    badge: 'OTP & Bank Card CVV Request',
    badgeType: 'high_risk',
    isDemonstration: true,
    url: 'http://scholarship-disbursement-portal.xyz/verify',
    text: 'Urgent notice regarding your National STEM Scholarship sanction. To release your ₹50,000 grant immediately, enter your card number with CVV and provide your 6-digit OTP for Aadhaar bank account verification. Failure to verify within 2 hours will forfeit the award.',
    expectedOutcome: 'HIGH_RISK',
  },
  {
    id: 'demo_lookalike_domain',
    label: 'Synthetic: Lookalike Government Portal',
    badge: 'Lookalike Subdomain on Unconventional TLD',
    badgeType: 'caution',
    isDemonstration: true,
    url: 'https://isro.gov.in.careers-apply.xyz/trainee',
    text: 'Indian Space Research Organisation Apprentice Trainee online registration link. Review qualification norms and submit graduation details. Registration open for 2025/2026 engineering graduates.',
    expectedOutcome: 'HIGH_RISK', // Lookalike subdomain + High abuse TLD
  },
  {
    id: 'demo_ambiguous_review',
    label: 'Synthetic: Ambiguous Career Notice',
    badge: 'Third-Party Notice Requiring Verification',
    badgeType: 'caution',
    isDemonstration: true,
    url: 'https://tech-student-updates-hub.com/internships',
    text: 'Summer Software Engineering Internships 2026 are opening across Bangalore and Hyderabad for 3rd and 4th year B.Tech students. Stipend ranges from ₹40,000 to ₹80,000 per month. Check the blog update for links to original company career portals.',
    expectedOutcome: 'CAUTION',
  },
  {
    id: 'demo_benign_official',
    label: 'Synthetic: Authentic Official Notice',
    badge: 'Approved Government Educational Domain',
    badgeType: 'lower_risk',
    isDemonstration: true,
    url: 'https://www.isro.gov.in/Careers.html',
    text: 'Indian Space Research Organisation invites online applications from eligible engineering and technology graduates for engagement as Graduate Apprentice Trainees under the Apprentices Act. Applications are accepted strictly through the verified NATS portal. Selection is purely on academic merit. Beware of fraudulent agents claiming to guarantee selection; ISRO never collects money for recruitment.',
    expectedOutcome: 'LOWER_RISK',
  },
];

module.exports = {
  DEMONSTRATION_EXAMPLES,
};

