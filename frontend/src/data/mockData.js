// Clean default state — all mock records removed.
// Starts with 0 documents, 0 users, and 0 logs for fresh registration.

export const mockDocuments = [];

export const mockAuditLogs = [];

export const mockAdminAlerts = [];

export const mockStats = {
  totalDocuments: 0,
  highRiskDocuments: 0,
  sharedDocuments: 0,
  recentAccessEvents: 0,
};

export const mockAdminStats = {
  totalUsers: 0,
  documentsAnalyzed: 0,
  highRiskDocuments: 0,
  blockedAccessAttempts: 0,
};

export const riskDistributionData = {
  low: 0,
  medium: 0,
  high: 0,
};

export const accessActivityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [0, 0, 0, 0, 0, 0, 0],
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
  { id: 9, label: 'Audit & Monitoring', icon: 'Eye' },
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
    example: 'General Document',
    color: 'emerald',
    controls: ['Basic encryption', 'Secure link', 'Basic access logging'],
    prominent: false,
  },
  {
    level: 'MEDIUM RISK',
    example: 'Academic / Institutional Record',
    color: 'amber',
    controls: ['Encryption', 'Password protection', 'Access expiry', 'Watermark', 'Audit logging'],
    prominent: false,
  },
  {
    level: 'HIGH RISK',
    example: 'Identity Document / Financial Record',
    color: 'rose',
    controls: ['Strong encryption', 'OTP / MFA', 'Password protection', 'Short-lived access', 'Watermark', 'Download restriction', 'Detailed audit logging'],
    prominent: true,
  },
];

export const uploadSteps = [
  'Saving uploaded document...',
  'Extracting text (OCR)...',
  'Detecting sensitive information...',
  'Assessing risk...',
  'Generating security policy...',
];
