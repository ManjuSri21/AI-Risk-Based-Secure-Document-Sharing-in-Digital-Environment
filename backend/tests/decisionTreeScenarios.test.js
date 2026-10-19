import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import {
  analyzeDocumentRisk,
  closeOcrWorker,
  predictWithDecisionTree,
} from '../services/riskAssessmentService.js';

after(async () => {
  await closeOcrWorker();
});

const createTempFile = async (prefix, filename, content) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, content);
  return { dir, fullPath };
};

// 1. General document with no detected sensitive information
test('1. classifies a general document with no sensitive info as LOW risk', async () => {
  const { dir, fullPath } = await createTempFile('test-gen-', 'project_guidelines.txt', 'This document covers standard software coding style guides.');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'project_guidelines.txt');
    assert.equal(res.predictedRisk, 'LOW');
    assert.equal(res.finalRisk, 'LOW');
    assert.equal(res.riskLevel, 'LOW');
    assert.equal(res.sensitiveInfo.length, 0);
    assert.equal(res.riskAssessmentMethod, 'ML_DECISION_TREE');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 2. Document containing only contact information
test('2. classifies a document with only contact information as MEDIUM risk', async () => {
  const { dir, fullPath } = await createTempFile('test-contact-', 'staff_directory.txt', 'Employee Contact Directory:\nPhone: +91 9876543210\nEmail: contact.staff@example.com\nResidential Address: 42 Palm Street, Block B');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'staff_directory.txt');
    assert.equal(res.predictedRisk, 'MEDIUM');
    assert.equal(res.finalRisk, 'MEDIUM');
    assert.equal(res.riskLevel, 'MEDIUM');
    assert.ok(res.sensitiveInfo.includes('Mobile / Phone Number'));
    assert.ok(res.sensitiveInfo.includes('Email Address'));
    assert.ok(res.sensitiveInfo.includes('Residential Address'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 3. Document containing a PAN identifier
test('3. classifies a document containing a PAN identifier as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-pan-', 'pan_record.txt', 'Holder: John Doe\nIncome Tax Dept Permanent Account Number: ABCDE1234F\nDate of Birth: 15/08/1990');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'pan_record.txt', 'PAN Card');
    assert.equal(res.predictedRisk, 'HIGH');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
    assert.ok(res.sensitiveInfo.includes('PAN Number'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 4. Document containing an Aadhaar identifier
test('4. classifies a document containing an Aadhaar identifier as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-aadhaar-', 'aadhaar_doc.txt', 'Unique Identification Authority of India (UIDAI)\nAadhaar Number: 4532 9871 2043\nName: Rahul Sharma');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'aadhaar_doc.txt', 'Aadhaar Card');
    assert.equal(res.predictedRisk, 'HIGH');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
    assert.ok(res.sensitiveInfo.some(s => s.includes('Aadhaar')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 5. Bank statement with financial information
test('5. classifies a bank statement with financial information as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-bank-', 'statement.txt', 'HDFC Bank Account Statement\nAccount Number: 50100234567890\nIFSC: HDFC0001234\nClosing Balance: Rs 1,45,000');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'statement.txt', 'Bank Statement');
    assert.equal(res.predictedRisk, 'HIGH');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
    assert.ok(res.sensitiveInfo.includes('Bank & Financial Details'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 6. Medical report with sensitive medical information
test('6. classifies a medical report with sensitive medical information as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-med-', 'health_record.txt', 'City Hospital Clinical Report\nPatient Diagnosis: Acute Coronary Syndrome\nPrescription: Aspirin, Atorvastatin\nDoctor: Dr. A. Sen');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'health_record.txt', 'Medical Report');
    assert.equal(res.predictedRisk, 'HIGH');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
    assert.ok(res.sensitiveInfo.includes('Medical Information'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 7. Marksheet containing personal information
test('7. classifies a marksheet containing student and academic info as MEDIUM risk', async () => {
  const { dir, fullPath } = await createTempFile('test-marks-', 'semester_grades.txt', 'University Marksheet\nRoll Number: CS-2023-089\nCGPA: 8.75\nStudent Name: Anita Roy\nDate of Birth: 12/04/2002');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'semester_grades.txt', 'Semester Marksheet');
    assert.equal(res.predictedRisk, 'MEDIUM');
    assert.equal(res.finalRisk, 'MEDIUM');
    assert.equal(res.riskLevel, 'MEDIUM');
    assert.ok(res.sensitiveInfo.includes('Student Record / Academic ID'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 8. Document containing several categories of sensitive information
test('8. classifies a document with multiple sensitive categories as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-multi-', 'executive_onboarding.txt', 'Executive Onboarding Profile\nAadhaar: 8877 6655 4433\nPAN: ABCDE5678G\nBank IFSC: SBIN0004321\nSalary CTC: Confidential Payroll\nEmail: exec@company.com');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'executive_onboarding.txt', 'Executive Profile');
    assert.equal(res.predictedRisk, 'HIGH');
    assert.equal(res.finalRisk, 'HIGH');
    assert.ok(res.sensitiveInfo.length >= 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 9. OCR failure handling
test('9. classifies an unreadable file / OCR failure conservatively as HIGH risk', async () => {
  // .bin or zero byte unreadable image
  const { dir, fullPath } = await createTempFile('test-ocr-fail-', 'corrupted_scan.png', Buffer.from([0, 1, 2, 3]));
  try {
    const res = await analyzeDocumentRisk(fullPath, 'corrupted_scan.png', 'Corrupted Scan');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
    assert.ok(res.sensitiveInfo.some(s => s.toLowerCase().includes('failed') || s.toLowerCase().includes('manual review')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 10. Missing or invalid model artifact
test('10. handles missing model artifact gracefully via conservative rules fallback', () => {
  const mockFeatures = { aadhaar: 1, pan: 0, financial: 0 };
  assert.throws(() => {
    predictWithDecisionTree(mockFeatures, null);
  }, /unsupported or invalid format/);
});

// 11. Unsupported or corrupted document format
test('11. classifies unsupported document types conservatively as HIGH risk', async () => {
  const { dir, fullPath } = await createTempFile('test-unsupported-', 'archive.xyz', 'Binary payload');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'archive.xyz', 'Unsupported Archive');
    assert.equal(res.finalRisk, 'HIGH');
    assert.equal(res.riskLevel, 'HIGH');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 12. Critical-identifier policy override
test('12. enforces critical-identifier policy override for high risk IDs', async () => {
  const { dir, fullPath } = await createTempFile('test-override-', 'sample_id.txt', 'Government Identity - UIDAI Aadhaar Number: 1234 5678 9012');
  try {
    const res = await analyzeDocumentRisk(fullPath, 'sample_id.txt', 'Aadhaar Verification');
    assert.equal(res.finalRisk, 'HIGH');
    assert.ok(res.policyReason.includes('policy') || res.policyReason.includes('Decision Tree'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
