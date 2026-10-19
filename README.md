# SecureShare AI — Intelligent Risk-Aware Document Security & Adaptive Sharing Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205-61dafb?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![AI / ML](https://img.shields.io/badge/AI%20%2F%20ML-Scikit--Learn%20%7C%20Tesseract%20OCR-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![Security](https://img.shields.io/badge/Security-Adaptive%20Policy%20%7C%20MFA%20%7C%20AES--256-blueviolet?logo=shield)](https://owasp.org/)

**SecureShare AI** (SecureShare) is an end-to-end, enterprise-grade, risk-aware document security and controlled sharing platform. Unlike conventional cloud storage and file-sharing solutions (such as Google Drive, Dropbox, or email attachments) that enforce a static, one-size-fits-all security model, SecureShare AI autonomously inspects the sensitivity and risk level of every uploaded document using **AI-driven OCR and Machine Learning**, dynamically generates **adaptive security policies**, and enforces **zero-trust recipient access gates** with forensic watermarking and immutable audit trails.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Industry Need](#2-problem-statement--industry-need)
3. [The 5-Stage Intelligent Security Pipeline](#3-the-5-stage-intelligent-security-pipeline)
4. [Key Features & Innovations](#4-key-features--innovations)
5. [Complete Technology Stack](#5-complete-technology-stack)
6. [System Architecture & Data Flow](#6-system-architecture--data-flow)
7. [Adaptive Security Policy Matrix](#7-adaptive-security-policy-matrix)
8. [Project Structure](#8-project-structure)
9. [Installation & Getting Started Guide](#9-installation--getting-started-guide)
10. [Environment Configuration](#10-environment-configuration)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [User & Admin Application Workflow](#12-user--admin-application-workflow)
13. [Security, Privacy & Compliance Highlights](#13-security-privacy--compliance-highlights)
14. [License](#14-license)

---

## 1. Executive Summary

Modern organizations and remote teams exchange thousands of sensitive digital files every day—ranging from public brochures to highly confidential employee national identity cards, financial balance sheets, salary registers, patient diagnostic reports, and legal case files. 

Treating every document identically introduces severe security liabilities:
- **Over-securing** low-risk files hinders collaboration and user experience.
- **Under-securing** high-risk files leads to regulatory penalties, corporate espionage, and devastating data breaches.

**SecureShare AI brings Content-Aware Adaptive Security:**
1. **Understands Content**: Automatically parses text and scans images using Optical Character Recognition (OCR).
2. **Evaluates Risk**: Identifies Personally Identifiable Information (PII) and scores document vulnerability (0–100) using a trained Machine Learning model.
3. **Enforces Adaptive Protection**: Automatically dictates encryption strength, access lifetime, password requirements, Multi-Factor Authentication (OTP), download permissions, and forensic watermarking.
4. **Governs Distribution**: Generates time-bound, tokenized share links and QR codes protected by recipient verification gates.
5. **Audits Forensically**: Captures immutable activity records (IP addresses, user roles, action types, device fingerprints, and timestamps).

---

## 2. Problem Statement & Industry Need

In standard cloud drives and email platforms:
- **No Inherent Risk Awareness:** Systems do not know whether a PDF contains an innocuous meeting agenda or 1,000 Aadhaar numbers and bank statements.
- **Permanent, Unrevocable Links:** Links frequently stay active indefinitely, creating persistent attack vectors.
- **Lack of Leak Traceability:** If a recipient downloads or captures a screenshot of a confidential file, the source of the leak cannot be determined.
- **No Dynamic Verification:** Anyone with the URL can view the asset without proving their identity via multi-factor mechanisms.

SecureShare AI directly eliminates these vulnerabilities, aligning with the **Digital Personal Data Protection (DPDP) Act**, **GDPR**, **HIPAA**, and **Zero-Trust Enterprise Architecture**.

---
## 3. The 5-Stage Intelligent Security Pipeline

SecureShare AI operates on a deterministic, automated five-stage pipeline:

```
   +----------------+
   | 1. UPLOAD      |  User uploads PDF, PNG, JPG, or DOCX document
   +-------+--------+
           |
           v
   +----------------+
   | 2. EXTRACT/OCR |  Multi-engine text extraction via pdf-parse & Tesseract OCR
   +-------+--------+
           |
           v
   +----------------+
   | 3. AI RISK ML  |  PII entity detection + 15-feature Scikit-Learn Decision Tree
   +-------+--------+
           |
           v
   +----------------+
   | 4. ADAPTIVE    |  Dynamic policy synthesis (AES-256, OTP/PIN, Expiry, Watermark)
   |    POLICY      |
   +-------+--------+
           |
           v
   +----------------+
   | 5. CONTROLLED  |  Tokenized Link/QR + Recipient Verification Gate + Forensic Audit
   |    SHARING     |
   +----------------+
```

1. **Upload & Ingestion:** High-speed, secure multipart upload with MIME verification, size throttling, and secure disk isolation.
2. **Multi-Engine Text Extraction & Deep OCR:**
   - Native digital PDF parsing via `pdf-parse` for instant text extraction.
   - High-resolution canvas rendering via `pdfjs-dist` and `@napi-rs/canvas` for scanned PDF documents.
   - Deep Optical Character Recognition using `tesseract.js` (LSTM neural network engine with pre-trained models) for scanned files and images.
3. **AI Risk Assessment & PII Detection:**
   - Detects critical PII and regulatory entities:
     - **National IDs:** Indian Aadhaar (12 digits with format checking), Permanent Account Number (PAN).
     - **Financial Assets:** Bank account numbers, IFSC codes, credit card sequences, salary figures, and compensation disclosures.
     - **Contact & PII:** Email addresses, phone numbers, full names, dates of birth, and home addresses.
     - **Confidential Records:** Medical diagnostics, prescription records, academic transcripts.
   - Evaluates a 15-dimensional feature vector through a trained **Scikit-Learn Decision Tree Classifier** (with mathematical heuristic fallback) to generate a **Normalized Risk Score (0–100)** and categorical risk tier (**LOW**, **MEDIUM**, **HIGH**).
4. **Adaptive Policy Engine:** Automatically configures security constraints proportional to the classified risk tier.
5. **Controlled Distribution & Forensic Verification:**
   - Cryptographically random, tokenized sharing URLs and high-resolution QR codes.
   - Real-time recipient gate demanding Passcode / PIN and Two-Factor Email OTP.
   - Dynamic canvas watermarking burning recipient email, IP address, and timestamp into the document view.
   - Immediate administrative revocation capabilities.

---

## 4. Key Features & Innovations

### AI Risk Scoring & PII Detection
- **Multi-Class Entity Extraction:** Automatically flags sensitive data across PDFs, images, and text files.
- **AI Confidence Score:** Provides granular probability metrics explaining why a document was tagged Low, Medium, or High risk.
- **Interactive Risk Progress Visualization:** Real-time visual progress bars and risk badges across all user and admin tables.

### Adaptive Security Policy Engine
- **Autonomous Policy Assignment:** Eliminates human guesswork by calculating exact encryption, expiry, and authentication parameters immediately upon upload.
- **Zero-Trust Access Control:** Enforces strict role separation between Standard Users and Administrators.

### Recipient Verification Gate (MFA / OTP)
- **Tokenized Share Links:** Access is granted strictly via cryptographically secure UUID tokens.
- **Multi-Factor Recipient Authentication:** High-risk documents demand Two-Factor Email OTP (via Nodemailer) before rendering.
- **Password / Passcode Protection:** Optional and enforced PIN entry gates.

### Dynamic Forensic Watermarking
- **Client-Side Canvas Rendering:** Documents rendered through the viewer receive a tamper-resistant diagonal watermark displaying recipient email, client IP address, and access timestamp.
- **Data Leak Deterrent:** Ensures any photograph or screenshot can be traced directly to the offending recipient.

### User Repository ("My Documents")
- **Risk Summary Cards:** At-a-glance counters for Total Documents, High Risk, Medium Risk, and Low Risk files.
- **Modern Enterprise Table:** Features columns for Document Name, Upload Date, File Size, File Type, AI Risk Score (colored progress bar), Status Badge, Last Modified, and Actions (View, Analyze, Share, Policy, Delete).

### Enterprise Admin Command Center
- **Executive Analytics:** High-level metrics on total system documents, users, active shares, and risk distributions.
- **Real-Time Risk Monitoring:** Dedicated dashboard showcasing flagged threats, high-risk anomalies, and quarantined files.
- **User Management & Governance:** Admin controls to inspect user activity, review security statuses, and manage accounts.
- **Platform-Wide Audit Logs:** Searchable audit logs equipped with role badges (Admin vs User), client IP addresses, action categories, and timestamps.

---
## 5. Complete Technology Stack

### Frontend Architecture

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | [React](https://react.dev/) | `^18.3.1` | Component-driven declarative UI architecture |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) | `^5.4.2` | Lightning-fast development server with Hot Module Replacement (HMR) |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^7.18.4` | Client-side SPA routing with protected role gates |
| **Styling & Design System**| [Tailwind CSS](https://tailwindcss.com/) | `^3.4.19` | Utility-first styling with custom dark navy / teal theme |
| **CSS Preprocessing** | [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) | Latest | Cross-browser CSS compatibility and prefixing |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.53.0` | Clean, modern SVG icons for high visual clarity |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) | `^4.5.1` / `^5.3.1` | Dynamic bar, line, and doughnut charts for security analytics |
| **QR Code Generation** | [qrcode.react](https://github.com/zpao/qrcode.react) | `^4.2.0` | Real-time QR code generation for mobile link sharing |
| **Micro-Interactions** | [canvas-confetti](https://github.com/catdad/canvas-confetti) | `^1.9.4` | Interactive celebration effects on successful shares |
| **Typography** | Google Fonts ([Inter](https://fonts.google.com/specimen/Inter) & [Sora](https://fonts.google.com/specimen/Sora)) | Web | Modern, enterprise-grade typography |

### Backend API Architecture

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime Environment** | [Node.js](https://nodejs.org/) | `>= 18.0.0` (ESM) | High-concurrency asynchronous JavaScript runtime |
| **Web Server Framework** | [Express.js](https://expressjs.com/) | `^4.21.2` | RESTful API service orchestration |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | `^8.9.5` | Document-oriented database for users, files, shares, and audits |
| **Authentication & Tokens**| [JSON Web Tokens (JWT)](https://jwt.io/) | `^9.0.2` | Stateless bearer token authentication |
| **Password Hashing** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `^2.4.3` | Cryptographic password hashing with salt rounds |
| **File Ingestion** | [Multer](https://github.com/expressjs/multer) | `^1.4.5-lts.1` | Multi-part form-data handling with disk storage and type filters |
| **API Security Headers** | [Helmet](https://helmetjs.github.io/) | `^8.0.0` | HTTP header hardening (CSP, CORP, HSTS, XSS protection) |
| **CORS Governance** | [CORS](https://github.com/expressjs/cors) | `^2.8.5` | Strict origin whitelisting for frontend client |
| **Rate Limiting** | [express-rate-limit](https://github.com/nfet/express-rate-limit) | `^7.5.0` | Brute-force and DDoS mitigation per IP window |
| **Environment Config** | [dotenv](https://github.com/motdotla/dotenv) | `^16.4.7` | Zero-dependency environment variable loader |

### AI, OCR & Machine Learning Engine

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Machine Learning** | [Python](https://www.python.org/) + [Scikit-Learn](https://scikit-learn.org/) | `3.10+` / `^1.4` | Offline training of Decision Tree risk classification model |
| **Model Deployment** | JSON Rule Representation (`risk_model.json`) | Custom | Ultra-fast, zero-overhead Node.js decision tree evaluation |
| **OCR Engine** | [Tesseract.js](https://tesseract.projectnaptha.com/) | `^6.0.1` | Neural network LSTM OCR engine for scanned images & documents |
| **Language Trained Data** | `@tesseract.js-data/eng` | `^1.0.0` | Pre-compiled English OCR dataset |
| **PDF Text Extraction** | [pdf-parse](https://www.npmjs.com/package/pdf-parse) | `^1.1.1` | Fast digital text layer extraction from PDF files |
| **PDF Page Rendering** | [pdfjs-dist](https://mozilla.github.io/pdf.js/) | `^4.10.38` | Legacy PDF rendering pipeline for image rasterization |
| **Headless Canvas Engine**| [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) | `^0.1.100` | High-performance Rust-backed canvas for OCR raster & watermarks |

### Communications & Delivery

| Category | Technology | Purpose |
|---|---|---|
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) | Automated delivery of verification OTPs and security alerts via SMTP |

---

## 6. System Architecture & Data Flow

```
+-----------------------------------------------------------------------------+
|                            FRONTEND (React + Vite)                          |
|  Landing Page  |  Dashboard  |  Upload Zone  |  Repository  |  Admin Center |
+--------------------------------------┬--------------------------------------+
                                       | HTTPS / JSON / FormData
                                       v
+-----------------------------------------------------------------------------+
|                           BACKEND API (Express.js)                          |
|                                                                             |
|   [Helmet] ---> [CORS] ---> [RateLimiter] ---> [JWT Auth / Role Check]      |
|                                                       |                     |
|                        +------------------------------+-----------------+   |
|                        v                                               v   |
|               [documentRoutes]                                   [shareRoutes] |
|                        |                                               |   |
|                        v                                               v   |
|       +--------------------------------+            +------------------+   |
|       │   OCR & TEXT EXTRACTION LAYER   │            │ RECIPIENT ACCESS │   |
|       │  - pdf-parse (Digital PDFs)    │            │ GATE (PIN & OTP) │   |
|       │  - Tesseract.js (Scanned OCR)  │            +--------+---------+   |
|       +----------------+---------------+                     |             |
|                        |                                     v             |
|                        v                            +------------------+   |
|       +--------------------------------+            │ REAL-TIME CANVAS │   |
|       │   AI RISK ASSESSMENT SERVICE   │            │ WATERMARK VIEWER │   |
|       │  - PII Detection (Aadhaar/PAN) │            +------------------+   |
|       │  - Scikit-Learn Decision Tree  │                                   |
|       +----------------+---------------+                                   |
|                        |                                                   |
|                        v                                                   |
|       +--------------------------------+                                   |
|       │     ADAPTIVE POLICY ENGINE     │                                   |
|       │  - Low / Medium / High Matrix  │                                   |
|       +----------------+---------------+                                   |
|                        |                                                   |
+------------------------+---------------------------------------------------+
                         |
                         v
+-----------------------------------------------------------------------------+
|                       DATABASE & AUDIT (MongoDB Atlas)                      |
|   Users Collection  |  Documents Collection  |  Shares  |  Audit Logs       |
+-----------------------------------------------------------------------------+
```

---
## 7. Adaptive Security Policy Matrix

Based on the AI risk score and detected entities, the system synthesizes and enforces the following policy matrix:

| Security Parameter | LOW RISK (Score: 0–35) | MEDIUM RISK (Score: 36–70) | HIGH RISK (Score: 71–100) |
|---|---|---|---|
| **Typical Content** | Public announcements, marketing collateral, general documentation | Internal memos, departmental notes, business plans | Aadhaar cards, PAN, bank accounts, medical records, payroll |
| **Encryption Standard** | Standard AES-128 | Enhanced AES-256 | Military-Grade AES-256 GCM |
| **Link Expiration** | 24 Hours | 6 Hours | 1 Hour (Short-lived) |
| **Recipient Gate** | Direct Secure Link | Password / Passcode Required | Password + Multi-Factor OTP (Email) |
| **Download Permission** | Allowed | Restricted (Max 1 Download) | **Blocked (View-Only in browser)** |
| **Watermarking** | Disabled | Standard Static Watermark | **Dynamic Forensic Watermark (Email + IP + Time)** |
| **Audit Trail Depth** | Standard Access Logging | Detailed Interaction Logging | **Immutable Forensic Trail (Full Telemetry)** |

---

## 8. Project Structure

```
ai-risk-based-secure-document-sharing/
├── README.md                           # Master Project Documentation
├── PROJECT_REVIEW_EXPLANATION.md       # Comprehensive Review & Architecture Guide
├── .gitignore
│
├── backend/                            # Express.js REST API & AI Service
│   ├── package.json                    # Backend dependencies & scripts
│   ├── server.js                       # Primary server entrypoint & middleware pipeline
│   ├── .env.example                    # Environment variable template
│   ├── eng.traineddata                 # Pre-trained Tesseract OCR English neural model
│   │
│   ├── config/                         # Infrastructure configuration
│   │   └── db.js                       # MongoDB connection with retry logic
│   │
│   ├── controllers/                    # Request handlers
│   │   ├── authController.js           # Registration, login, profile, password management
│   │   ├── documentController.js       # File upload, retrieval, deletion, risk triggers
│   │   ├── shareController.js          # Tokenized link creation, OTP generation, verification
│   │   ├── auditController.js          # User & platform audit logs retrieval
│   │   ├── adminController.js          # Admin dashboard metrics, user and file oversight
│   │   └── adminSecurityController.js  # Security settings and quarantine controls
│   │
│   ├── middleware/                     # Express middlewares
│   │   ├── authMiddleware.js           # JWT authentication and Admin role guard
│   │   └── uploadMiddleware.js         # Multer storage configuration and file validation
│   │
│   ├── ml/                             # Machine Learning risk assessment pipeline
│   │   ├── train_risk_model.py         # Python Scikit-Learn training script
│   │   ├── test_train_risk_model.py    # Unit tests for ML feature extraction & training
│   │   ├── requirements.txt            # Python dependencies (scikit-learn, numpy)
│   │   ├── risk_model.json             # Exported Decision Tree structure for Node.js
│   │   └── dataset/                    # Training and benchmark risk datasets
│   │
│   ├── models/                         # Mongoose Data Models
│   │   ├── User.js                     # User schema (roles, bcrypt hashes, status)
│   │   ├── Document.js                 # Document metadata, risk score, PII entities, policy
│   │   ├── Share.js                    # Tokenized share links, OTP states, access limits
│   │   ├── AuditLog.js                 # Comprehensive event logs (IP, user agent, action)
│   │   ├── AdminSecurity.js            # Security configurations and master key metadata
│   │   └── AdminSecuritySettings.js    # Platform threshold settings
│   │
│   ├── routes/                         # Express API route declarations
│   │   ├── authRoutes.js               # /api/auth
│   │   ├── documentRoutes.js           # /api/documents
│   │   ├── shareRoutes.js              # /api/shares
│   │   ├── auditRoutes.js              # /api/audit
│   │   └── adminRoutes.js              # /api/admin
│   │
│   ├── services/                       # Business logic & external integrations
│   │   ├── riskAssessmentService.js    # OCR engine, PII regex, and ML risk classification
│   │   ├── policyService.js            # Adaptive security policy synthesis engine
│   │   ├── emailService.js             # Nodemailer OTP and alert email sender
│   │   │   ├── auditLogger.js              # Centralized structured audit logging service
│   │   └── adminKeyService.js          # Cryptographic key derivation and storage
│   │
│   └── uploads/                        # Local file storage for uploaded documents
│
└── frontend/                           # React 18 + Vite SPA Client
    ├── package.json                    # Frontend dependencies & scripts
    ├── vite.config.js                  # Vite configuration & proxy settings
    ├── tailwind.config.js              # Tailwind custom theme, colors & animations
    ├── postcss.config.js               # PostCSS plugins
    ├── index.html                      # HTML entrypoint
    │
    └── src/
        ├── App.jsx                     # Root application router with role guards
        ├── main.jsx                    # React DOM entrypoint
        ├── index.css                   # Global styles & custom Tailwind component classes
        │
        ├── components/
        │   ├── layout/
        │   │   ├── DashboardLayout.jsx # Authenticated layout shell (Sidebar + Topbar)
        │   │   ├── Navbar.jsx          # Public landing page navigation bar
        │   │   ├── Sidebar.jsx         # Responsive sidebar with User/Admin navigation
        │   │   ├── Topbar.jsx          # Top bar with user profile, status, and logout
        │   │   └── Logo.jsx            # Dynamic brand logo component
        │   │
        │   └── ui/                     # Reusable UI components
        │       ├── DocumentTable.jsx   # Document table with AI Risk Score progress bars
        │       ├── AuditLogTable.jsx   # Sortable audit table with role badges & IP display
        │       ├── StatCard.jsx        # Dashboard metric card
        │       ├── RiskBadge.jsx       # Color-coded risk tier badge
        │       ├── RiskScore.jsx       # Visual risk meter gauge
        │       ├── SecurityPolicyCard.jsx # Formatted security policy card
        │       ├── SecurityPipeline.jsx   # 5-stage interactive workflow diagram
        │       ├── Charts.jsx          # Chart.js wrappers (Line, Bar, Doughnut)
        │       ├── UploadZone.jsx      # Drag-and-drop file upload component
        │       ├── Modal.jsx           # Accessible dialog modal
        │       └── Toast.jsx           # Toast notification provider & hook
        │
        ├── pages/                      # Application route pages
        │   ├── LandingPage.jsx         # Public marketing page with animations & pipeline
        │   ├── Login.jsx               # User / Admin authentication page
        │   ├── Register.jsx            # Account registration page
        │   │
        │   ├── UserDashboard.jsx       # Standard user analytics and quick actions
        │   ├── UploadDocument.jsx      # Multi-step upload with simulated OCR progress
        │   ├── RiskAnalysis.jsx        # Detailed AI risk report with detected PII breakdown
        │   ├── SecurityPolicy.jsx      # Adaptive policy view & customization
        │   ├── Repository.jsx          # User "My Documents" table with risk summary cards
        │   ├── ShareDocument.jsx       # Controlled share link & QR code generator
        │   ├── SharedDocumentAccess.jsx# Recipient portal with PIN/OTP gate & watermarking
        │   ├── AuditLogs.jsx           # User's personal activity audit log
        │   ├── Profile.jsx             # User profile settings & password change
        │   │
        │   ├── AdminDashboard.jsx      # Executive platform statistics & risk distributions
        │   ├── AdminDocuments.jsx      # Universal document repository & risk monitoring
        │   ├── AdminUsers.jsx          # User governance, status toggling, and role oversight
        │   ├── AdminRiskMonitoring.jsx # Real-time threat detection & quarantined files
        │   ├── AdminAuditLogs.jsx      # Enterprise platform-wide audit log
        │   └── AdminProfile.jsx        # Admin security profile & key management
        │
        ├── services/
        │   └── api.js                  # Centralized HTTP client with automatic JWT injection
        │
        └── data/
            └── mockData.js             # Fallback fixtures for offline demonstration
```

---
## 9. Installation & Getting Started Guide

### Prerequisites

- **Node.js**: Version `18.0.0` or higher (Node 20+ LTS recommended)
- **npm**: Version `9.0.0` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection URI
- *(Optional)* **Python 3.10+**: Only required if you wish to retrain the ML model in `backend/ml/`

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ai-risk-based-secure-document-sharing.git
cd ai-risk-based-secure-document-sharing
```

---

### Step 2: Configure and Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your configuration:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/secureshare
   JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   UPLOAD_DIR=uploads

   # (Optional) Email MFA notifications via Gmail SMTP
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-google-app-password

   
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on **`http://localhost:5001`**. Verify health by opening `http://localhost:5001/api/health`.*

---

### Step 3: Configure and Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start on **`http://localhost:5173`**.*

---

## 10. Environment Configuration

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port on which the Express server listens | `5001` |
| `NODE_ENV` | Runtime environment mode | `development` / `production` |
| `MONGO_URI` | Connection string for MongoDB database | `mongodb://127.0.0.1:27017/secureshare` |
| `JWT_SECRET` | High-entropy secret key for signing JWTs | `your-32-char-random-secret` |
| `JWT_EXPIRES_IN`| Validity duration for user sessions | `7d` |
| `FRONTEND_URL` | Whitelisted URL for CORS cross-origin requests | `http://localhost:5173` |
| `UPLOAD_DIR` | Local folder for isolated file storage | `uploads` |
| `SMTP_USER` | Gmail or SMTP email address for OTP delivery | `your-account@gmail.com` |
| `SMTP_PASS` | App password for Gmail SMTP | `16-character-app-password` |


### Frontend (`frontend/.env` optional)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API root endpoint | `http://localhost:5001/api` |

---

## 11. API Endpoints Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate credentials and receive a signed JWT token
- `GET /api/auth/profile` - Retrieve authenticated user profile
- `PUT /api/auth/profile` - Update profile information
- `PUT /api/auth/change-password` - Update password

### 2. Document Management (`/api/documents`)
- `POST /api/documents/upload` - Upload file for OCR extraction and AI risk classification
- `GET /api/documents/my-documents` - List all documents belonging to the authenticated user
- `GET /api/documents/:id` - Retrieve document metadata and risk details
- `GET /api/documents/:id/risk-analysis` - Retrieve full PII breakdown and classification score
- `GET /api/documents/:id/policy` - Retrieve generated adaptive security policy
- `DELETE /api/documents/:id` - Remove document and revoke all active share links

### 3. Controlled Sharing (`/api/shares`)
- `POST /api/shares/create` - Generate a secure tokenized share link with policy constraints
- `GET /api/shares/active` - List active share links created by the current user
- `GET /api/shares/:token` - Retrieve public metadata and policy gate requirements for a shared file
- `POST /api/shares/:token/verify-passcode` - Validate PIN / password gate
- `POST /api/shares/:token/send-otp` - Dispatch Email verification code
- `POST /api/shares/:token/verify-otp` - Validate OTP and authorize document viewer session
- `DELETE /api/shares/:token/revoke` - Immediately revoke an active share link

### 4. Audit & Monitoring (`/api/audit`)
- `GET /api/audit/my-logs` - Retrieve personal document activity history
- `GET /api/audit/all` - Retrieve platform-wide audit log *(Admin only)*
- `GET /api/audit/export` - Export audit trail to CSV format

### 5. Admin Governance (`/api/admin`)
- `GET /api/admin/dashboard-stats` - Platform metrics and risk distribution analytics
- `GET /api/admin/documents` - Monitor all platform documents and risk scores
- `GET /api/admin/users` - Manage platform user accounts and access levels
- `GET /api/admin/risk-monitoring` - Real-time threat feeds and high-risk alerts
- `PUT /api/admin/documents/:id/quarantine` - Quarantine high-risk documents

---
## 12. User & Admin Application Workflow

### For Standard Users:
1. **Sign Up / Login:** Authenticate using JWT.
2. **Upload Document:** Drag-and-drop a PDF or image in `/upload`. Watch real-time OCR progress.
3. **Inspect AI Risk:** Review detected PII entities (e.g. Aadhaar, PAN, phone numbers) and the 0–100 risk score on `/risk-analysis`.
4. **Adaptive Policy:** View the synthesized policy on `/security-policy` (customizable within allowed safety limits).
5. **My Documents Repository:** Review all uploaded files on `/repository` with risk counters (Total, High, Medium, Low) and interactive risk progress bars.
6. **Share Document:** Generate a secure link with expiry, passcode, or Email OTP on `/share`.
7. **Audit Logs:** Monitor access events on `/audit-logs` with timestamps and client IP addresses.

### For Recipients:
1. Recipient receives a secure URL: `http://localhost:5173/shared-access/:token`
2. **Access Gate:** Prompted for passcode or Multi-Factor OTP if the document is Medium or High risk.
3. **Secure Viewer:** Document is presented with a non-removable diagonal forensic watermark displaying the recipient's identifier, IP, and timestamp.
4. **Download Protection:** If classified as High Risk, direct downloads and prints are strictly blocked.

### For Administrators:
1. Access the dedicated Admin portal via `/admin/dashboard`.
2. Review aggregated metrics, risk distributions, and recent platform events.
3. Inspect and filter every document in the system via `/admin/documents`.
4. Monitor high-risk threats and quarantine suspicious assets via `/admin/risk-monitoring`.
5. Examine enterprise audit logs with distinct user badges (Admin vs User) and source IP addresses on `/admin/audit-logs`.

---

## 13. Security, Privacy & Compliance Highlights

- **Zero Trust by Design:** No user or recipient is trusted by default. Every access request is verified at the token and session levels.
- **Data Minimization:** OCR text is analyzed strictly in memory during processing and can be scrubbed post-classification.
- **Forensic Attribution:** Every document view, OTP request, failed attempt, and download is permanently recorded with client IP and user-agent metadata.
- **OWASP Top 10 Mitigation:** Hardened with Helmet HTTP headers, strict CORS origin filtering, MongoDB sanitization, bcrypt password hashing, and express-rate-limit brute-force prevention.
- **Dynamic Watermarking:** Mitigates the classic "analog hole" (taking a picture of the screen) by embedding verifiable recipient identification directly into the rendered viewport.

---

## 14. License

This project is developed for educational, academic, and demonstration purposes. You are free to use, modify, and extend this codebase for research and development.
