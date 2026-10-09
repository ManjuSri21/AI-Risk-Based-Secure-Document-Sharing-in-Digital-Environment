# SecureShare AI — Intelligent Risk-Aware Document Security

SecureShare AI is an AI-powered document security platform that analyzes document sensitivity, classifies risk levels (Low, Medium, High), and automatically recommends adaptive security controls before documents are shared. It features secure sharing links, OTP/MFA authentication, access expiration, watermarking, and full audit monitoring.

This is a frontend demo/academic project showcasing a complete UI for an intelligent, risk-aware document sharing workflow.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Pages & Routes](#pages--routes)
- [UI Components](#ui-components)
- [Design System](#design-system)
- [Mock Data](#mock-data)
- [License](#license)

---

## Overview

SecureShare AI provides an end-to-end document security workflow:

1. **Upload** — Securely upload sensitive documents (PDFs, IDs, financial statements, etc.)
2. **Analyze** — AI-driven OCR and text extraction identify sensitive information (PII such as Aadhaar, PAN, bank details, phone, email, medical, salary, and passport numbers)
3. **Assess Risk** — Documents are classified as Low, Medium, or High risk with a confidence score
4. **Apply Controls** — Adaptive security policies are generated based on the risk level (encryption, OTP/MFA, password protection, expiry, watermarking, download restrictions)
5. **Share Securely** — Controlled sharing links with recipient authentication, access expiration, and full audit logging

---

## Features

- **AI Risk Assessment** — Automatic document classification as Low, Medium, or High risk with AI confidence scores
- **Sensitive Information Detection** — Detects PII including Aadhaar, PAN, bank details, phone numbers, email addresses, medical records, salary info, and passport numbers
- **Adaptive Security Policies** — Different risk levels receive tailored security controls:
  - **Low Risk**: Basic encryption, secure link, basic access logging
  - **Medium Risk**: Encryption, password protection, access expiry, watermark, audit logging
  - **High Risk**: Strong encryption, OTP/MFA, password protection, short-lived access, watermark, download restriction, detailed audit logging
- **Secure Sharing** — Generate controlled sharing links and QR-based document sharing
- **Access Expiration** — Automatically expire shared access after a specified time
- **Audit & Monitoring** — Track document access, sharing, downloads, OTP verification, and authentication events
- **Admin Dashboard** — Platform-wide analytics, user management, document oversight, risk monitoring, and security alerts
- **Animated Landing Page** — Modern marketing page with hero section, feature cards, security pipeline visualization, and call-to-action

---

## Tech Stack

| Category | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) (v18.3.1) | UI library for building component-based interfaces |
| **Build Tool** | [Vite 5](https://vitejs.dev/) (v5.4.2) | Next-gen frontend build tool with fast HMR |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) (v7.18.4) | Client-side routing for single-page application |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) (v3.4.19) | Utility-first CSS framework with custom theme |
| **PostCSS** | [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS processing and vendor prefix automation |
| **Icons** | [Lucide React](https://lucide.dev/) (v1.53.0) | Open-source icon library |
| **Charts** | [Chart.js](https://www.chartjs.org/) (v4.5.1) + [react-chartjs-2](https://react-chartjs-2.js.org/) (v5.3.1) | Data visualization for dashboards and analytics |
| **QR Codes** | [qrcode.react](https://github.com/zpao/qrcode.react) (v4.2.0) | QR code generation for secure document sharing |
| **Confetti Effects** | [canvas-confetti](https://github.com/catdad/canvas-confetti) (v1.9.4) | Celebration animations |
| **Linting** | [ESLint 9](https://eslint.org/) + eslint-plugin-react / react-hooks / react-refresh | Code quality and consistency |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) (body) + [Sora](https://fonts.google.com/specimen/Sora) (headings) | Google Fonts loaded via CSS import |

### Runtime Requirements

- **Node.js** >= 18 (recommended 20+)
- **npm** >= 9

---

## Project Structure

```
secureshare-ai/
├── index.html                  # HTML entry point
├── package.json                # Project manifest & scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind theme (colors, fonts, animations)
├── postcss.config.js           # PostCSS plugins config
├── eslint.config.js            # ESLint flat config
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component with routes
    ├── index.css               # Global styles & Tailwind layers
    ├── assets/
    │   └── react.svg
    ├── data/
    │   └── mockData.js         # Mock documents, audit logs, stats, config
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.jsx   # Sidebar + Topbar shell
    │   │   ├── Navbar.jsx            # Landing page top navigation
    │   │   ├── Sidebar.jsx           # Dashboard sidebar navigation
    │   │   ├── Topbar.jsx            # Dashboard top bar
    │   │   └── Logo.jsx              # Brand logo component
    │   └── ui/
    │       ├── AuditLogTable.jsx     # Audit log data table
    │       ├── Charts.jsx            # Chart.js chart wrappers
    │       ├── DocumentCard.jsx      # Document card view
    │       ├── DocumentTable.jsx     # Document list table
    │       ├── Modal.jsx             # Reusable modal dialog
    │       ├── RiskBadge.jsx         # Risk level badge
    │       ├── RiskScore.jsx         # Risk score gauge/display
    │       ├── SecurityPipeline.jsx  # End-to-end security pipeline visual
    │       ├── SecurityPolicyCard.jsx # Security policy detail card
    │       ├── StatCard.jsx          # Dashboard statistic card
    │       ├── Toast.jsx             # Toast notification system
    │       └── UploadZone.jsx        # Drag-and-drop upload area
    └── pages/
        ├── LandingPage.jsx           # Marketing/home page
        ├── Login.jsx                 # Login page
        ├── Register.jsx              # Registration page
        ├── UserDashboard.jsx         # User dashboard with stats
        ├── UploadDocument.jsx         # Document upload flow
        ├── RiskAnalysis.jsx          # AI risk analysis results
        ├── SecurityPolicy.jsx        # Adaptive security policy view
        ├── Repository.jsx            # Document repository
        ├── ShareDocument.jsx         # Secure sharing flow
        ├── SharedDocumentAccess.jsx  # Recipient document access
        ├── AuditLogs.jsx             # User audit logs
        ├── Profile.jsx               # User profile
        ├── AdminDashboard.jsx        # Admin analytics dashboard
        ├── AdminDocuments.jsx        # Admin document management
        ├── AdminRiskMonitoring.jsx   # Admin risk monitoring
        ├── AdminUsers.jsx            # Admin user management
        └── AdminAuditLogs.jsx        # Admin audit logs
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at the URL shown in your terminal (typically `http://localhost:5173`).

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot module reload |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally for preview |
| `npm run lint` | Run ESLint across the codebase |

---

## Pages & Routes

### Public Routes

| Route | Page | Description |
|---|---|---|
| `/` | LandingPage | Marketing page with hero, features, security levels, and pipeline |
| `/login` | Login | User login form |
| `/register` | Register | New account registration form |

### User Routes

| Route | Page | Description |
|---|---|---|
| `/dashboard` | UserDashboard | Personal stats, recent documents, activity |
| `/upload` | UploadDocument | Upload flow with simulated OCR & risk analysis steps |
| `/risk-analysis` | RiskAnalysis | AI risk assessment results with sensitive info detection |
| `/security-policy` | SecurityPolicy | Adaptive security policy based on risk level |
| `/repository` | Repository | Browse and manage uploaded documents |
| `/share` | ShareDocument | Generate secure sharing links & QR codes |
| `/shared-access` | SharedDocumentAccess | Recipient view with OTP/password authentication |
| `/audit-logs` | AuditLogs | Personal access history and event log |
| `/profile` | Profile | User profile and account settings |

### Admin Routes

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Platform-wide analytics and security alerts |
| `/admin/documents` | AdminDocuments | Manage all documents across the platform |
| `/admin/users` | AdminUsers | User management and oversight |
| `/admin/risk-monitoring` | AdminRiskMonitoring | Real-time risk monitoring and threat alerts |
| `/admin/audit-logs` | AdminAuditLogs | Full platform audit log |

---

## UI Components

### Layout Components

- **DashboardLayout** — Shell combining Sidebar + Topbar for all authenticated pages
- **Navbar** — Top navigation bar for the landing page
- **Sidebar** — Collapsible sidebar with user/admin navigation links
- **Topbar** — Page title, subtitle, and contextual actions
- **Logo** — SecureShare AI brand logo

### UI Components

- **StatCard** — Metric card with icon, value, and label
- **DocumentCard / DocumentTable** — Document display in card and table formats
- **RiskBadge / RiskScore** — Visual risk level indicators with color coding
- **Charts** — Chart.js wrappers for bar, line, and doughnut charts
- **SecurityPipeline** — Visual 10-step security workflow diagram
- **SecurityPolicyCard** — Detailed security control breakdown by risk level
- **AuditLogTable** — Sortable audit event table
- **UploadZone** — Drag-and-drop file upload area
- **Modal** — Reusable dialog component
- **Toast** — Toast notification provider and hook

---

## Design System

### Colors

The Tailwind theme defines three custom color ramps:

| Ramp | Purpose | Example Usage |
|---|---|---|
| **navy** | Dark backgrounds, text, sidebar | `bg-navy-900`, `text-navy-700` |
| **primary** (blue) | Primary actions, links, accents | `bg-primary-700`, `text-primary-50` |
| **accent** (teal/green) | Secondary highlights, gradients | `bg-accent-600`, `from-accent-500` |

Plus semantic Tailwind defaults: **emerald** (low risk / success), **amber** (medium risk / warning), **rose** (high risk / danger).

### Typography

- **Body font**: Inter (400, 500, 600, 700)
- **Heading font**: Sora (500, 600, 700, 800)
- **Line height**: 150% for body, 120% for headings

### Spacing

8px spacing system via Tailwind's default spacing scale.

### Animations

Custom keyframe animations defined in the Tailwind config:

- `fade-in`, `slide-up`, `slide-down`, `slide-in-right` — Entrance animations
- `scale-in` — Modal/card scale entrance
- `glow-pulse` — Ambient background glow
- `shimmer` — Skeleton loading effect
- `float` — Floating element effect
- `bounce-subtle`, `bounce-dot` — Subtle attention animations
- `spin-slow` — Slow rotation for loaders

### Reusable CSS Classes

Defined in `src/index.css` under `@layer components`:

| Class | Purpose |
|---|---|
| `.card` | White rounded card with soft shadow |
| `.glass` / `.glass-dark` | Glassmorphism surfaces |
| `.gradient-text` / `.gradient-text-teal` | Gradient text effect |
| `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-teal` / `.btn-danger` | Button variants |
| `.input-field` | Styled form input |
| `.badge` / `.badge-low` / `.badge-medium` / `.badge-high` / `.badge-success` / `.badge-warning` / `.badge-danger` | Status badges |
| `.nav-link` / `.nav-link-active` | Sidebar navigation links |
| `.skeleton` | Shimmer loading placeholder |

---

## Mock Data

All data is currently mocked in `src/data/mockData.js` for frontend demonstration:

- `mockDocuments` — 6 sample documents (Aadhaar, PAN, marksheet, resume, college ID, bank statement) with risk levels, scores, and sensitive info flags
- `mockAuditLogs` — 12 sample audit events (views, shares, OTP, blocked attempts)
- `mockAdminAlerts` — 4 security alert entries
- `mockStats` / `mockAdminStats` — Dashboard metric values
- `riskDistributionData` / `accessActivityData` — Chart datasets
- `securityPipeline` — 10-step pipeline stage definitions
- `howItWorksSteps` — Landing page workflow steps
- `featuresData` — Landing page feature cards
- `securityLevels` — Risk level control mappings
- `uploadSteps` — Simulated upload processing stages

---

## License

This is an academic/demo project. No license is attached — use freely for educational purposes.
