# Opplyra — Opportunities for a Brighter You

**Opplyra** is a student opportunity intelligence and trust platform. It helps students discover scholarships, internships, competitive examinations, and training opportunities, understand their eligibility, check suspicious announcements for common warning signs, and manage application deadlines.

### Visual Design System: Emerald Intelligence
- **Sidebar & Primary Brand Elements**: Deep Forest Green (`#102820`)
- **Main Canvas & Background**: Warm Ivory (`#F7F5ED`)
- **Primary Actions & Buttons**: Emerald Green (`#168568` / `#106B53`)
- **Highlights & Accents**: Muted Gold (`#D6B56D` / `#8C6D23`)
- **Readable Text**: Dark Charcoal (`#141714` / `#232924`)
- **Typography Pairing**: Playfair Display (headings) + Plus Jakarta Sans (body)
- **Scam Checking Interface**: Visually distinct with dark forest green surfaces (`#102820`) and clear, accessible warning indicators.

---

## Navigation & Core Features

1. **Dashboard**: Answers what opportunities you can apply for, what matches your profile, and what deadlines to remember.
2. **Find Opportunities**: Search and filter scholarships, internships, exams, and jobs with deadline countdowns.
3. **Check for Scams**: Deterministic rule-based tool that flags upfront fee demands, fake guarantees, and unofficial domains.
4. **My Applications**: Track opportunities across stages (`Saved`, `Planning to Apply`, `Applied`, `Completed`) with personal notes.
5. **Deadlines & Reminders**: Configure in-app reminder alerts for 7 days, 1 day, or 1 hour before deadlines.

---

## 1. Project Architecture & Structure

```
Opplyra/
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── index.js                     # Express server & error middleware
│       ├── seed.js                      # Database seed CLI
│       ├── config/
│       │   └── db.js                    # Dual-mode Mongoose connection with socket fallback
│       ├── models/
│       │   ├── Opportunity.js           # Opportunity catalogue schema
│       │   ├── SavedOpportunity.js      # Application tracking pipeline schema
│       │   ├── Profile.js               # Student profile attributes schema
│       │   └── Reminder.js              # Scheduled deadline alerts schema
│       ├── controllers/
│       │   ├── opportunityController.js # Catalogue & dashboard metrics
│       │   ├── savedController.js       # Save / unsave & pipeline statuses
│       │   ├── profileController.js     # Student profile management
│       │   ├── verificationController.js# Deterministic circular scrutiny
│       │   └── reminderController.js    # Deadline reminder configuration
│       ├── routes/
│       │   ├── opportunityRoutes.js
│       │   ├── savedRoutes.js
│       │   ├── profileRoutes.js
│       │   ├── verificationRoutes.js
│       │   └── reminderRoutes.js
│       ├── services/
│       │   ├── ruleEngine.js            # Deterministic empirical rule engine
│       │   ├── eligibilityService.js    # Criteria matching & evaluation logic
│       │   ├── ssrfProtection.js        # SSRF & loopback address security guard
│       │   └── memoryStore.js           # Seamless in-memory fallback store
│       └── seeds/
│           └── seedData.js              # Curated demonstration dataset
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                     # Vite React entry point
│       ├── App.jsx                      # App root state & modal orchestrator
│       ├── index.css                    # Tailwind CSS directives
│       ├── api/
│       │   └── client.js                # Resilient API communication client
│       ├── components/
│       │   ├── Sidebar.jsx              # Navy sidebar with storage mode pill
│       │   ├── Navbar.jsx               # Responsive header with CTA & avatar
│       │   ├── OpportunityCard.jsx      # Opportunity card with badges & save
│       │   ├── OpportunityModal.jsx     # Detail dialog with eligibility breakdown
│       │   ├── ProfileModal.jsx         # Profile attribute editor
│       │   ├── ReminderModal.jsx        # Offset alert scheduler (7d, 1d, 1h)
│       │   ├── StatusBadge.jsx          # Reusable status & category badges
│       │   └── Toast.jsx                # Non-blocking feedback toast
│       └── pages/
│           ├── DashboardPage.jsx        # Welcome banner, metrics & deadlines
│           ├── CataloguePage.jsx        # Searchable, filterable catalogue
│           ├── VerificationPage.jsx     # Rule-based scam detection tool
│           ├── SavedTrackerPage.jsx     # Application pipeline tracker
│           └── RemindersPage.jsx        # Scheduled deadline alert monitors
├── package.json                         # Root monorepo orchestrator
└── README.md
```

---

## 2. Setup and Run Commands

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)
- MongoDB (Optional: persistent MongoDB is automatically detected; if offline, Opplyra activates the In-Memory Dev Fallback).

### One-Command Quickstart
```bash
# From the root directory:
npm run install:all

# Seed database (if MongoDB is available):
npm run seed

# Run backend (port 5001):
npm run dev:backend

# In a separate terminal, run frontend (port 5173):
npm run dev:frontend
```

### Direct Folder Execution
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

Visit the app in your browser at `http://localhost:5173`.

---

## 3. Environment Variables

Create `backend/.env` (a template is provided in `backend/.env.example`):

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/opplyra
NODE_ENV=development
```

---

## 4. REST API Endpoint Catalogue

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status, app version, and storage mode (MongoDB vs In-Memory Fallback) |
| `GET` | `/api/opportunities` | Query opportunities with `?category=`, `?search=`, `?sort=` |
| `GET` | `/api/opportunities/dashboard-summary` | Metrics: totals, saved count, active applications, upcoming deadlines |
| `GET` | `/api/opportunities/:id` | Opportunity detail with live profile eligibility evaluation |
| `GET` | `/api/profile` | Current student profile attributes (course, year, CGPA, location) |
| `PUT` | `/api/profile` | Update student profile attributes |
| `GET` | `/api/saved` | List saved opportunities with `?status=` filter |
| `POST` | `/api/saved` | Save opportunity (`{ opportunityId, status, notes }`) |
| `PATCH`| `/api/saved/:opportunityId` | Update application status (`Interested`, `Preparing`, `Applied`, `Completed`) |
| `DELETE`| `/api/saved/:opportunityId` | Remove opportunity from saved tracker |
| `POST` | `/api/verification/check` | Analyze announcement text/URL using deterministic rule engine |
| `GET` | `/api/reminders` | List scheduled deadline alerts with simulated delivery status |
| `POST` | `/api/reminders` | Schedule reminder (`7_days_before`, `1_day_before`, `1_hour_before`) |
| `DELETE`| `/api/reminders/:id` | Cancel/delete scheduled reminder |

---

## 5. Security & Verification Engine Design

### Deterministic Rule Engine (No Hallucinations)
Opplyra does **not** rely on arbitrary probability percentages or untrusted generative text. It inspects submitted content against empirical threat rules:
1. **R1: Upfront Financial Payment Demands**: Flags registration fees, caution deposits, and payments requested via personal UPI, Google Pay, QR codes, or crypto.
2. **R2: Unrealistic Guarantees**: Flags "100% selection guaranteed", "direct joining without exam", or promises of "earn ₹50,000 daily with no experience".
3. **R3: Coercive Urgency Language**: Flags high-pressure intimidation ("pay before midnight or seat cancelled", "disqualified if not reported within 2 hours").
4. **R4: Unofficial Contact Channels**: Flags official recruitments operating via WhatsApp personal numbers, Telegram broadcast channels, or public webmail accounts (`@gmail.com`, `@yahoo.com`).
5. **R5 & R6: Domain Impersonation**: Flags purported Indian Government entities hosted on non-governmental TLDs (anything outside `.gov.in` and `.nic.in`) or free public web builders (Blogspot, Wix, Weebly).
6. **R7: Unconventional TLDs**: Flags low-cost disposable TLDs (`.xyz`, `.top`, `.buzz`, `.club`, `.work`).

### SSRF (Server-Side Request Forgery) Prevention
When a URL is submitted:
- Disallows non-HTTP/HTTPS protocols (`file:`, `ftp:`, `gopher:`).
- Blocks loopback addresses (`127.0.0.1`, `::1`, `localhost`).
- Blocks RFC 1918 private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) and link-local (`169.254.0.0/16`).
- Blocks cloud metadata endpoints (`169.254.169.254`).

---

## 6. Features Implemented & Tested

- [x] **Full-Stack Runnable Architecture**: Node/Express REST backend on port 5001 + React/Vite/Tailwind frontend on port 5173.
- [x] **Dual Storage Mode**: Real MongoDB connection through Mongoose with auto-fallback to an In-Memory Dev Store when disconnected.
- [x] **Dashboard**: Real-time stats, category shortcuts, recommended opportunities, and upcoming deadlines.
- [x] **Catalogue**: Multi-category filtering (Scholarships, Internships, Exams, Jobs), keyword search, sorting by deadline, and transparent "Demonstration Record" labels.
- [x] **Assistive Eligibility Engine**: Compares student profile attributes (degree, year, CGPA, location, category) against stated parameters with MATCHED, UNMATCHED, and UNKNOWN statuses and explicit non-definitive disclaimers.
- [x] **Deterministic Notice Verification**: Text and URL scanner with rule-grounded evidence snippets, plain-language explanations, what remains unknown, and student safety checklists.
- [x] **Application Pipeline Tracker**: Organizes opportunities across `Interested`, `Preparing`, `Applied`, and `Completed` with editable preparation notes.
- [x] **Deadline Alerts**: Timed reminder scheduler for 7 days, 1 day, and 1 hour before deadlines with visible scheduled/delivered status.

---

## 7. Known Limitations

- **Simulated In-App Reminders**: For this hackathon MVP, deadline reminders trigger inside the dashboard rather than sending real SMS or emails (email/push integrations require third-party API credentials).
- **Curated Demonstration Dataset**: Opportunities are realistic, clearly labelled demonstration records for hackathon showcase.
- **Assistive Eligibility**: Analysis is based on stated criteria; students must confirm requirements with the issuing authority before official submission.

---

## 8. Concise Hackathon Demo Script (3-Minute Walkthrough)

1. **Dashboard & Navigation**: Open `http://localhost:5173`. Show the Dark Navy sidebar, Teal accent, greeting with student profile (Priya Sharma, 3rd Year B.Tech CS), and the active storage status badge.
2. **Opportunity Discovery**: Click **Opportunity Catalogue**. Filter by "Internships" and search "Google" or "Research". Point out the official source link, deadline countdown, and "Demo Record" badge.
3. **Inspect Eligibility**: Click "Inspect Eligibility" on the Google or STEM Scholarship card. Switch to the **Profile Alignment** tab to see matched and mismatched criteria. Click "Edit Profile Attributes", alter CGPA or course, and observe the eligibility status re-calculate instantly!
4. **Notice Verification**: Navigate to **Verification Engine**. Click **Sample 1: Railway Scam (High Risk)** and run analysis. Show the 4 detected empirical indicators (upfront fees, 100% guarantee, coercive midnight deadline, and `.xyz` domain mismatch). Point out the exact matched evidence snippets and plain-language explanation.
5. **Legitimate Check**: Click **Sample 3: Legitimate Official Notice** and run analysis. Show that it cleanly returns "No configured warning indicators detected" while responsibly maintaining that offline aspects remain unverified.
6. **Save & Pipeline Tracking**: Save the opportunity. Switch to **Saved & Tracker**. Move status from `Interested` to `Preparing` and add a preparation note.
7. **Deadline Alert**: Click "Set Alert", choose "1 day before deadline", and open **Deadlines & Reminders** to see the scheduled trigger.

