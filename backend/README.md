# SecureShare – Backend API

Complete Node.js / Express.js / MongoDB REST API backend for **SecureShareAI - AI Risk-Based Secure Document Sharing in Digital Environments**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v22.15.x or later installed)
- **MongoDB** (Local MongoDB running at `mongodb://127.0.0.1:27017/secureshare` or MongoDB Atlas connection string)

### 2. Environment Configuration
The file `backend/.env` contains the base local configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/secureshare
JWT_SECRET=supersecret_secureshare_jwt_key_2026_academic_demo
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=uploads
ADMIN_MASTER_KEY=replace-with-a-long-random-secret-used-to-encrypt-admin-key-material
```
Replace the `ADMIN_MASTER_KEY` placeholder with a randomly generated secret of at least 32 characters. It encrypts generated administrator key material before it is persisted in MongoDB. Keep it in the local environment or a secrets manager; do not commit it. If it is missing, key rotation fails instead of using a built-in fallback. Back it up securely: losing it makes stored key material unrecoverable.

The backend uses Gmail SMTP (`smtp.gmail.com`, port `587`) by default and Node.js's system CA certificates for TLS verification. This allows Node.js to trust certificates installed in the operating system's trusted CA store without disabling certificate checks. Only add these sender credentials:
```env
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-16-character-app-password
```
*(If you are using MongoDB Atlas, simply replace `MONGO_URI` with your Atlas SRV connection string. Add the real Gmail address and App Password locally; do not commit them.)*
For Gmail, set `SMTP_USER` to the sending Gmail address and `SMTP_PASS` to its Google App Password. The sender address defaults to that Gmail account. OTP-protected shares and email-delivered share links need these two settings; without them, share creation or OTP delivery reports a configuration error instead of returning a fake success.
Share URLs use the browser's current origin, so open the app using a reachable hostname/IP before creating a QR code for another device. `FRONTEND_URL` is the fallback for requests without a browser origin.

#### Gmail SMTP setup
1. Enable 2-Step Verification on the Gmail account that will send messages.
2. Create an App Password in the Google Account security settings. Do not use the account's regular password.
3. Add `SMTP_USER=your-account@gmail.com` and `SMTP_PASS=your-16-character-app-password` to your local `backend/.env`.
4. Restart the Backend server so it reloads the environment variables. The start scripts enable Node.js system CA certificates for verified SMTP TLS.
5. Generate a new share link, then verify that its OTP email arrives. Check the recipient's spam folder if needed.

Never commit `backend/.env` or share the App Password. If Gmail SMTP returns an authentication error, revoke that App Password and create a replacement.

When password protection is enabled, email shares send only the secure link. The sender enters the recipient's mobile number in international format; after creating the link, WhatsApp can be opened with a password-only message draft. The sender must review and send that message. No WhatsApp gateway is configured, and the password is not sent or stored by a messaging provider through the backend.

#### Local document text extraction and OCR
PDF text is extracted locally first. Image uploads (PNG/JPG/JPEG) and scanned PDFs with no usable text are processed with the bundled English Tesseract model; scanned PDFs are limited to their first five pages. OCR text is analyzed in memory and is not stored; only detected sensitive-data categories and a redacted summary are saved. Aadhaar and PAN identifiers, bank/financial details, mobile numbers, date-of-birth labels, and address labels contribute to the risk assessment; detecting a PAN card/number or Aadhaar identifier is a high-risk signal. If OCR cannot read a supported image/PDF or a document format has no text extractor, it is marked high risk for manual review instead of silently receiving a low-risk score. OCR recognizes printed English best; verify low-quality, handwritten, or non-English scans manually.

#### Supervised ML risk model workflow
The current classifier remains the existing rules-based risk assessment unless `backend/ml/risk_model.json` exists. To build a real supervised decision-tree model:

1. Upload representative documents and have an authorized reviewer assess each risk category in **Admin → Documents → Label risk**. Labels should follow a consistent risk rubric; do not use the system prediction itself as the review label.
2. In Admin → Documents, select **Export Reviewed Labels**. The CSV contains only boolean sensitive-category/file-type/extraction indicators and the reviewer label; it does not contain document names, extracted text, or personal values.
3. Install the training dependency and train with the exported CSV:
   ```powershell
   cd backend
   C:\Users\<you>\AppData\Local\Programs\Python\Python313\python.exe -m pip install -r ml\requirements.txt
   C:\Users\<you>\AppData\Local\Programs\Python\Python313\python.exe ml\train_risk_model.py path\to\risk-training-data.csv
   ```
   The trainer requires at least 30 reviewer-labeled examples for each class (LOW, MEDIUM, HIGH), creates a stratified holdout evaluation, and exports only if macro F1 is at least 0.65 and HIGH-risk recall is at least 0.80. Failed validation leaves the rules-based classifier active.
4. The validated model is written to `backend/ml/risk_model.json`, which the backend uses automatically for predictions. Restart the backend after training. The model artifact is intentionally git-ignored; securely deploy that validated artifact alongside the backend if using it outside the training machine.

Predictions record whether the rules fallback or ML decision tree produced the risk assessment. OCR/extraction failures continue to receive HIGH risk for manual review rather than being passed to the model. The tree is trained on minimized indicators—not raw text—and estimates sensitivity risk only. It does not establish authenticity, detect malware, or replace human review. Review dataset quality and per-class validation metrics before deployment; the initial thresholds are minimum gates, not a guarantee of accuracy.

#### Document authenticity
The system does not authenticate documents or check whether one was issued by UIDAI, a bank, or another organization. Technical file-safety scanning, structural validation, and malware scanning are disabled. Uploads are limited to the supported file types and size configured by the upload endpoint; risk assessment is not a malware scan and does not prove authenticity or safety. Uploaded documents may be fake or unsafe. Authenticity must be verified independently with the claimed issuer.

---


## 🛠️ API Architecture & Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` – Register user or admin
- `POST /api/auth/login` – Login & receive JWT token
- `GET /api/auth/me` – Get profile of current logged-in user
- `PUT /api/auth/profile` – Update full name / email
- `PUT /api/auth/change-password` – Secure password update

### 📄 Documents & AI Risk Engine (`/api/documents`)
- `POST /api/documents/upload` – Upload a document, extract local text/OCR, and assign LOW / MEDIUM / HIGH risk using the rules fallback or a validated optional ML decision tree
- `GET /api/documents` – List user's documents with search and risk filters
- `GET /api/documents/:id` – Detailed document metadata and risk breakdown
- `DELETE /api/documents/:id` – Delete document and physical file
- `PUT /api/documents/:id/policy` – Update adaptive security policy

### 🔗 Secure Sharing & Verification (`/api/shares`)
- `POST /api/shares/create` – Create time-bounded share token with adaptive controls (Password, OTP, Watermark, Expiry, Download Restrictions)
- `GET /api/shares/:token/info` – Get share metadata (public, non-sensitive)
- `POST /api/shares/:token/verify-password` – Verify recipient access password and email an OTP when required
- `POST /api/shares/:token/request-otp` – Email an OTP for shares without password protection
- `POST /api/shares/:token/verify-otp` – Verify two-factor OTP
- `GET /api/shares/:token/view` – Stream the actual file after recipient verification
- `GET /api/shares/:token/download` – Download the shared file if permission allows

### 📋 Audit Logging (`/api/audit`)
- `GET /api/audit/my-logs` – User personal forensic activity logs
- `GET /api/audit/admin-logs` – System-wide forensic audit trail

### 🛡️ Administration & SOC (`/api/admin`)
- `GET /api/admin/stats` – Global metrics (users, documents analyzed, high-risk docs, blocked attempts)
- `GET /api/admin/users` – User management and document ownership statistics
- `PATCH /api/admin/users/:id/status` – Suspend or activate user accounts
- `GET /api/admin/documents` – Global document risk monitoring
- `PATCH /api/admin/documents/:id/risk-label` – Record an authorized human-reviewed risk label for training
- `GET /api/admin/risk-training-data` – Export reviewed, minimized feature rows as CSV
- `GET /api/admin/risk-telemetry` – Global risk level distribution & telemetry
- `GET /api/admin/security` – Active key metadata, recent key history, and persisted admin security settings
- `PATCH /api/admin/security/settings` – Persist administrator security setting changes
- `POST /api/admin/security/key/rotate` – Generate and activate a new encrypted key record
- `POST /api/admin/security/key/:id/activate` – Restore a non-revoked previous key
- `POST /api/admin/security/key/:id/revoke` – Permanently revoke an inactive key

---

## 🔒 Security Features
1. **Helmet & Rate Limiting** – Protection against brute force and DDoS attacks.
2. **Bcryptjs Password Hashing** – Industry-standard salt + hash security.
3. **Role-Based Access Control (RBAC)** – Strict `user` and `admin` permission isolation.
4. **Adaptive Policy Engine** – Automatically adapts security enforcement (e.g. mandatory OTP + watermark for High Risk).
5. **Fail-Safe Mock Fallback** – The frontend remains functional even when the database is restarting or offline.

### Administrator key-management scope
Generated key material is encrypted at rest with AES-256-GCM using a key derived from `ADMIN_MASTER_KEY`. MongoDB stores the encrypted key material and rotation history; the raw material is never returned by the admin API. Rotations, restores, revocations, blocked revocations, and settings changes are written to the audit log. The key registry is currently not connected to encryption/decryption of uploaded document files, so this feature must not be represented as re-encrypting the document vault.
