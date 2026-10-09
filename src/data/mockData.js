export const mockDocuments = [
  {
    id: 'doc-001',
    name: 'Aadhaar_Card.pdf',
    type: 'PDF',
    riskLevel: 'HIGH',
    riskScore: 92,
    aiConfidence: 94,
    status: 'Protected',
    lastAccessed: '2 minutes ago',
    lastModified: '2026-10-06',
    owner: 'Manju',
    size: '2.4 MB',
    sensitiveInfo: ['Aadhaar Number', 'Full Name', 'Date of Birth', 'Address', 'Phone Number'],
    icon: 'FileText',
  },
  {
    id: 'doc-002',
    name: 'PAN_Card.pdf',
    type: 'PDF',
    riskLevel: 'HIGH',
    riskScore: 88,
    aiConfidence: 91,
    status: 'Protected',
    lastAccessed: '1 hour ago',
    lastModified: '2026-10-05',
    owner: 'Manju',
    size: '1.8 MB',
    sensitiveInfo: ['PAN Number', 'Full Name', 'Date of Birth'],
    icon: 'FileText',
  },
  {
    id: 'doc-003',
    name: 'College_Marksheet.pdf',
    type: 'PDF',
    riskLevel: 'MEDIUM',
    riskScore: 61,
    aiConfidence: 87,
    status: 'Shared',
    lastAccessed: '1 hour ago',
    lastModified: '2026-10-04',
    owner: 'Manju',
    size: '3.2 MB',
    sensitiveInfo: ['Student Name', 'Roll Number', 'Marks', 'CGPA'],
    icon: 'FileText',
  },
  {
    id: 'doc-004',
    name: 'Resume.pdf',
    type: 'PDF',
    riskLevel: 'LOW',
    riskScore: 28,
    aiConfidence: 95,
    status: 'Protected',
    lastAccessed: 'Yesterday',
    lastModified: '2026-10-01',
    owner: 'Manju',
    size: '0.5 MB',
    sensitiveInfo: ['Phone Number', 'Email Address'],
    icon: 'FileText',
  },
  {
    id: 'doc-005',
    name: 'College_ID.pdf',
    type: 'PDF',
    riskLevel: 'MEDIUM',
    riskScore: 54,
    aiConfidence: 89,
    status: 'Protected',
    lastAccessed: '3 days ago',
    lastModified: '2026-09-28',
    owner: 'Manju',
    size: '1.1 MB',
    sensitiveInfo: ['Student ID', 'Name', 'Photo'],
    icon: 'FileText',
  },
  {
    id: 'doc-006',
    name: 'Bank_Statement.pdf',
    type: 'PDF',
    riskLevel: 'HIGH',
    riskScore: 95,
    aiConfidence: 96,
    status: 'Protected',
    lastAccessed: '2 days ago',
    lastModified: '2026-09-30',
    owner: 'Manju',
    size: '4.7 MB',
    sensitiveInfo: ['Account Number', 'Name', 'Balance', 'Transactions'],
    icon: 'FileText',
  },
];

export const mockAuditLogs = [
  { id: 1, timestamp: '10:42 AM', user: 'Manju', document: 'Aadhaar_Card.pdf', action: 'Viewed', ip: '192.168.1.10', result: 'Success' },
  { id: 2, timestamp: '10:31 AM', user: 'Recipient', document: 'Aadhaar_Card.pdf', action: 'OTP Verified', ip: '192.168.1.15', result: 'Success' },
  { id: 3, timestamp: '10:28 AM', user: 'Recipient', document: 'Aadhaar_Card.pdf', action: 'Password Entered', ip: '192.168.1.15', result: 'Success' },
  { id: 4, timestamp: '10:15 AM', user: 'Manju', document: 'College_Marksheet.pdf', action: 'Shared', ip: '192.168.1.10', result: 'Success' },
  { id: 5, timestamp: '09:54 AM', user: 'Unknown', document: 'Bank_Statement.pdf', action: 'Access Attempt', ip: '192.168.1.20', result: 'Blocked' },
  { id: 6, timestamp: '09:30 AM', user: 'Manju', document: 'PAN_Card.pdf', action: 'Analyzed', ip: '192.168.1.10', result: 'Success' },
  { id: 7, timestamp: '09:12 AM', user: 'Unknown', document: 'Aadhaar_Card.pdf', action: 'Failed OTP', ip: '10.0.0.5', result: 'Blocked' },
  { id: 8, timestamp: '08:45 AM', user: 'Manju', document: 'Resume.pdf', action: 'Downloaded', ip: '192.168.1.10', result: 'Success' },
  { id: 9, timestamp: '08:30 AM', user: 'System', document: 'Bank_Statement.pdf', action: 'Risk Assessed', ip: 'Internal', result: 'Success' },
  { id: 10, timestamp: '08:15 AM', user: 'Manju', document: 'College_ID.pdf', action: 'Uploaded', ip: '192.168.1.10', result: 'Success' },
  { id: 11, timestamp: 'Yesterday 22:30', user: 'Unknown', document: 'PAN_Card.pdf', action: 'Unauthorized Download', ip: '203.0.113.5', result: 'Blocked' },
  { id: 12, timestamp: 'Yesterday 18:00', user: 'Recipient', document: 'College_Marksheet.pdf', action: 'Link Expired', ip: '192.168.1.15', result: 'Warning' },
];

export const mockAdminAlerts = [
  { id: 1, title: 'High-risk document shared', desc: 'Aadhaar_Card.pdf was shared with external recipient', severity: 'high', time: '10 min ago' },
  { id: 2, title: 'Repeated failed OTP attempt', desc: '3 failed OTP attempts for Bank_Statement.pdf', severity: 'high', time: '25 min ago' },
  { id: 3, title: 'Expired link access attempt', desc: 'Attempted access to expired link for College_Marksheet.pdf', severity: 'medium', time: '1 hour ago' },
  { id: 4, title: 'Unauthorized download attempt', desc: 'Blocked download attempt on PAN_Card.pdf', severity: 'high', time: '2 hours ago' },
];

export const mockStats = {
  totalDocuments: 24,
  highRiskDocuments: 6,
  sharedDocuments: 12,
  recentAccessEvents: 18,
};

export const mockAdminStats = {
  totalUsers: 1248,
  documentsAnalyzed: 5842,
  highRiskDocuments: 1024,
  blockedAccessAttempts: 87,
};

export const riskDistributionData = {
  low: 10,
  medium: 8,
  high: 6,
};

export const accessActivityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [45, 62, 38, 71, 55, 28, 42],
};

export const securityPipeline = [
  { id: 1, label: 'Document Upload', icon: 'Upload' },
  { id: 2, label: 'OCR / Text Extraction', icon: 'ScanText' },
  { id: 3, label: 'Sensitive Info Detection', icon: 'Search' },
  { id: 4, label: 'AI Risk Assessment', icon: 'Brain' },
  { id: 5, label: 'Adaptive Security Policy', icon: 'ShieldCheck' },
  { id: 6, label: 'Secure Document Storage', icon: 'Lock' },
  { id: 7, label: 'Controlled Sharing', icon: 'Share2' },
  { id: 8, label: 'Recipient Authentication', icon: 'UserCheck' },
  { id: 9, label: 'Document Access', icon: 'FileText' },
  { id: 10, label: 'Audit & Monitoring', icon: 'Eye' },
];

export const riskColors = {
  LOW: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600', score: '#10b981' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600', score: '#f59e0b' },
  HIGH: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', gradient: 'from-rose-400 to-rose-600', score: '#f43f5e' },
};

export const howItWorksSteps = [
  { num: '01', title: 'Upload', desc: 'Upload your sensitive document securely.', icon: 'Upload' },
  { num: '02', title: 'Analyze', desc: 'AI identifies sensitive information and document characteristics.', icon: 'ScanSearch' },
  { num: '03', title: 'Assess Risk', desc: 'Determine whether the document has Low, Medium, or High security risk.', icon: 'Gauge' },
  { num: '04', title: 'Apply Controls', desc: 'Generate appropriate security controls based on the risk level.', icon: 'ShieldCheck' },
  { num: '05', title: 'Share Securely', desc: 'Share using controlled access, authentication, expiry, and monitoring.', icon: 'Share2' },
];

export const featuresData = [
  { icon: 'Brain', title: 'AI Risk Assessment', desc: 'Automatically classify documents as Low, Medium, or High risk.' },
  { icon: 'Search', title: 'Sensitive Information Detection', desc: 'Detect PII like Aadhaar, PAN, bank details, phone, email, medical, salary, and passport numbers.' },
  { icon: 'SlidersHorizontal', title: 'Adaptive Security Policies', desc: 'Different risk levels receive different security controls.' },
  { icon: 'Share2', title: 'Secure Sharing', desc: 'Generate controlled sharing links and QR-based sharing.' },
  { icon: 'Clock', title: 'Access Expiration', desc: 'Automatically expire access after a specified time.' },
  { icon: 'Eye', title: 'Audit & Monitoring', desc: 'Track document access, sharing, downloads, and authentication events.' },
];

export const securityLevels = [
  {
    level: 'LOW RISK',
    example: 'College timetable',
    color: 'emerald',
    controls: ['Basic encryption', 'Secure link', 'Basic access logging'],
    prominent: false,
  },
  {
    level: 'MEDIUM RISK',
    example: 'College marksheet',
    color: 'amber',
    controls: ['Encryption', 'Password protection', 'Access expiry', 'Watermark', 'Audit logging'],
    prominent: false,
  },
  {
    level: 'HIGH RISK',
    example: 'Aadhaar / PAN / Bank document',
    color: 'rose',
    controls: ['Strong encryption', 'OTP / MFA', 'Password protection', 'Short-lived access', 'Watermark', 'Download restriction', 'Detailed audit logging'],
    prominent: true,
  },
];

export const uploadSteps = [
  'Uploading...',
  'Extracting text (OCR)...',
  'Detecting sensitive information...',
  'Assessing risk...',
  'Generating security policy...',
];
