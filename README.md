# SecureShare AI — Intelligent Risk-Aware Document Security

SecureShare AI is an AI-powered secure document sharing platform that analyzes document sensitivity, determines risk levels (Low, Medium, High), and automatically recommends adaptive security controls before a document is shared.

> **Note:** This is a frontend-only demo built for an academic project. All data is mock/static and no backend or real AI processing is connected.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Security Pipeline](#security-pipeline)
- [Risk Classification System](#risk-classification-system)
- [Pages & Routes](#pages--routes)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [License](#license)

---

## Overview

Sharing sensitive documents (Aadhaar cards, PAN cards, bank statements, marksheets, etc.) carries significant risk. SecureShare AI addresses this by:

1. **Uploading** the document securely.
2. **Extracting text** via OCR.
3. **Detecting sensitive information** (PII such as Aadhaar numbers, PAN numbers, phone numbers, emails, bank details, etc.).
4. **Assessing risk** using AI to classify the document as Low, Medium, or High risk.
5. **Generating an adaptive security policy** tailored to the risk level.
6. **Enabling secure sharing** with controls like OTP verification, passwords, watermarks, access expiry, download restrictions, and audit logging.

### Key Metrics (Demo)

| Metric | Value |
|---|---|
| Documents Protected | 10K+ |
| Risk Detection Accuracy | 98.7% |
| Risk Levels | 3 (Low / Medium / High) |
| Monitoring | 24/7 |

---

## Features

### AI Risk Assessment
- Automatic classification of documents into **Low**, **Medium**, and **High** risk categories.
- AI confidence scoring per document.
- Visual risk score gauge with animated circular progress.

### Sensitive Information Detection
Detects PII including:
- Aadhaar Number
- PAN Number
- Bank Account Number & Balance
- Phone Number
- Email Address
- Full Name & Date of Birth
- Address
- Student ID / Roll Number / CGPA
- Salary & Passport Numbers

### Adaptive Security Policies

| Risk Level | Example Document | Security Controls |
|---|---|---|
| **Low** | College timetable | Basic encryption, secure link, basic access logging |
| **Medium** | College marksheet | Encryption, password protection, access expiry, watermark, audit logging |
| **High** | Aadhaar / PAN / Bank document | Strong encryption, OTP/MFA, password protection, short-lived access, watermark, download restriction, detailed audit logging |

### Secure Sharing
- Secure share links with configurable expiry (15 min – 24 hours).
- QR code-based sharing.
- Email-based sharing.
- Toggleable security controls: password, OTP, watermark, expiry, download restriction, audit logging.
- Copy-to-clipboard share links.

### Recipient Authentication Flow
Multi-step verification for shared document access:
1. **Password** entry.
2. **OTP** verification (6-digit code with countdown timer).
3. **Document access** with watermark overlay and download restrictions.

### Audit & Monitoring
- Immutable forensic audit trail of all document activity.
- Filterable logs by: All, Successful, Blocked, Authentication, Downloads, Sharing.
- Searchable by document, user, or action.
- Tracks: views, uploads, downloads, shares, OTP events, access attempts, risk assessments, and unauthorized actions.
- Visual summary of successful events, blocked attempts, and warnings.

### Admin Dashboard
- System-wide security monitoring and risk oversight.
- User management (total, active, suspended, new users).
- Document monitoring across all users with risk and policy visibility.
- Risk monitoring with distribution charts and access activity trends.
- Security alerts feed for high-priority events.
- System-wide audit log access.

### UI/UX
- Clean, professional design with Inter + Sora typography.
- Smooth animations: fade-in, slide-up, scale-in, glow-pulse, shimmer.
- Responsive across mobile, tablet, and desktop.
- Toast notifications for user feedback.
- Modal dialogs for confirmations and details.
- Consistent 8px spacing system.
- Custom color system: navy, primary (blue), accent (teal), plus semantic colors (emerald, amber, rose).

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18.3 |
| **Build Tool** | Vite 5.4 |
| **Routing** | React Router DOM 7 |
| **Styling** | Tailwind CSS 3.4 |
| **Icons** | lucide-react |
| **Charts** | Chart.js + react-chartjs-2 |
| **QR Codes** | qrcode.react |
| **Confetti** | canvas-confetti |
| **Linting** | ESLint 9 |

---

## Project Structure

```
secoreshare-ai/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx                    # App entry point
    ├── App.jsx                     # Router & route definitions
    ├── index.css                   # Global styles, Tailwind layers, component classes
    ├── assets/
    │   └── react.svg
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.jsx # Sidebar + Topbar wrapper
    │   │   ├── Logo.jsx            # Brand logo
    │   │   ├── Navbar.jsx          # Landing page navigation
    │   │   ├── Sidebar.jsx         # Dashboard sidebar (user & admin variants)
    │   │   └── Topbar.jsx          # Dashboard top bar with search & profile
    │   └── ui/
    │       ├── AuditLogTable.jsx   # Reusable audit log table
    │       ├── Charts.jsx          # Risk doughnut & access activity charts
    │       ├── DocumentCard.jsx    # Document card for grid views
    │       ├── DocumentTable.jsx   # Document table with action buttons
    │       ├── Modal.jsx           # Reusable modal dialog
    │       ├── RiskBadge.jsx       # Risk level badge component
    │       ├── RiskScore.jsx       # Animated circular risk score gauge
    │       ├── SecurityPipeline.jsx# End-to-end security pipeline visualization
    │       ├── SecurityPolicyCard.jsx # Adaptive security policy display
    │       ├── StatCard.jsx        # Dashboard statistic card
    │       ├── Toast.jsx           # Toast notification system (context-based)
    │       └── UploadZone.jsx      # Drag-and-drop file upload zone
    ├── data/
    │   └── mockData.js             # All mock/static data
    └── pages/
        ├── LandingPage.jsx         # Marketing landing page
        ├── Login.jsx               # Login screen
        ├── Register.jsx            # Registration screen
        ├── UserDashboard.jsx       # User dashboard with stats & charts
        ├── UploadDocument.jsx      # Document upload with AI processing animation
        ├── RiskAnalysis.jsx        # AI risk assessment results
        ├── SecurityPolicy.jsx      # Adaptive security policy generation
        ├── Repository.jsx          # User's document repository (grid view)
        ├── ShareDocument.jsx       # Secure sharing configuration
        ├── SharedDocumentAccess.jsx# Recipient authentication & document preview
        ├── AuditLogs.jsx           # User audit logs
        ├── Profile.jsx             # User profile & security settings
        ├── AdminDashboard.jsx      # Admin overview dashboard
        ├── AdminDocuments.jsx      # Admin document monitoring
        ├── AdminRiskMonitoring.jsx # Admin risk analytics
        ├── AdminUsers.jsx          # Admin user management
        └── AdminAuditLogs.jsx      # Admin audit logs
```

---

## Security Pipeline

The platform follows a 10-stage end-to-end security workflow:

| # | Stage | Description |
|---|---|---|
| 01 | Document Upload | Secure file upload (PDF, JPG, PNG, DOCX; max 10 MB) |
| 02 | OCR / Text Extraction | Optical character recognition to extract text |
| 03 | Sensitive Info Detection | AI identifies PII and sensitive data fields |
| 04 | AI Risk Assessment | Machine learning model classifies risk level |
| 05 | Adaptive Security Policy | Security controls generated based on risk |
| 06 | Secure Document Storage | Encrypted storage of the document |
| 07 | Controlled Sharing | Secure link / QR / email sharing with controls |
| 08 | Recipient Authentication | Password + OTP verification flow |
| 09 | Document Access | Watermarked, download-restricted access |
| 10 | Audit & Monitoring | Immutable logging of all access events |

---

## Risk Classification System

### Low Risk (Score: 0–39)
- **Examples:** College timetable, general notices
- **Controls:** Basic encryption, secure link, basic access logging
- **Color:** Emerald

### Medium Risk (Score: 40–74)
- **Examples:** College marksheet, college ID, resume
- **Controls:** Encryption, password protection, access expiry, watermark, audit logging
- **Color:** Amber

### High Risk (Score: 75–100)
- **Examples:** Aadhaar card, PAN card, bank statement
- **Controls:** Strong encryption, OTP/MFA, password protection, short-lived access, watermark, download restriction, detailed audit logging
- **Color:** Rose

---

## Pages & Routes

### Public Routes

| Route | Page | Description |
|---|---|---|
| `/` | LandingPage | Marketing page with features, how-it-works, security levels |
| `/login` | Login | Sign-in screen with branding panel |
| `/register` | Register | Account creation screen |
| `/shared-access` | SharedDocumentAccess | Recipient document access with password + OTP |

### User Routes

| Route | Page | Description |
|---|---|---|
| `/dashboard` | UserDashboard | Stats, risk overview chart, security pipeline, recent docs |
| `/upload` | UploadDocument | Drag-and-drop upload with AI processing animation |
| `/risk-analysis` | RiskAnalysis | Risk score gauge, detected PII, AI recommendations |
| `/security-policy` | SecurityPolicy | Adaptive policy card with apply action |
| `/repository` | Repository | Document grid with search, filter, view, share, delete |
| `/share` | ShareDocument | Sharing config with controls, expiry, QR code |
| `/audit-logs` | AuditLogs | Filterable audit trail |
| `/profile` | Profile | Profile info, security settings toggles, account actions |

### Admin Routes

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | System stats, risk distribution, alerts, quick links |
| `/admin/documents` | AdminDocuments | All-system document table with filters |
| `/admin/users` | AdminUsers | User management table |
| `/admin/risk-monitoring` | AdminRiskMonitoring | Risk analytics, charts, breakdown bars |
| `/admin/audit-logs` | AdminAuditLogs | System-wide audit logs |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/secoreshare-ai.git
cd secoreshare-ai

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Builds the production bundle into the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- **Fonts:** Inter (body), Sora (headings)
- **Color ramps:** Navy, Primary (blue), Accent (teal), plus semantic colors (emerald, amber, rose)
- **Custom animations:** fade-in, slide-up, slide-down, scale-in, glow-pulse, shimmer, bounce-subtle, float, slide-in-right, bounce-dot
- **Custom shadows:** soft, float
- **8px spacing system** with consistent rounding

### Vite

Standard Vite + React plugin configuration.

### ESLint

Configured with:
- `@eslint/js` recommended rules
- `eslint-plugin-react` (JSX runtime)
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

---

## License

This project is an academic/demo project and is not licensed for production use.
