import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { createCanvas } from '@napi-rs/canvas';
import {
  analyzeDocumentRisk,
  closeOcrWorker,
  predictWithDecisionTree,
} from '../services/riskAssessmentService.js';

after(async () => {
  await closeOcrWorker();
});

const createSyntheticIdImage = () => {
  const canvas = createCanvas(900, 320);
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000';
  context.font = '28px Arial';
  context.fillText('Aadhaar Number: 9999 9999 9999', 24, 70);
  context.fillText('Mobile Number: 9999999999', 24, 140);
  context.fillText('Date of Birth: 01/01/2000', 24, 210);
  context.fillText('Address: 12 Sample Street', 24, 280);
  return canvas;
};

const createImagePdf = (imageData) => {
  const content = Buffer.from('q\n450 0 0 160 0 0 cm\n/Im0 Do\nQ\n');
  const objects = [
    Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'),
    Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'),
    Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 450 160] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'),
    Buffer.concat([
      Buffer.from(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 900 /Height 320 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageData.length} >>\nstream\n`),
      imageData,
      Buffer.from('\nendstream\nendobj\n'),
    ]),
    Buffer.concat([
      Buffer.from(`5 0 obj\n<< /Length ${content.length} >>\nstream\n`),
      content,
      Buffer.from('endstream\nendobj\n'),
    ]),
  ];
  const chunks = [Buffer.from('%PDF-1.4\n')];
  const offsets = [0];
  let length = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    chunks.push(object);
    length += object.length;
  });
  const xrefOffset = length;
  chunks.push(Buffer.from(
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  ));
  return Buffer.concat(chunks);
};

const analyzeNamedDocument = async (documentName) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'secureshare-risk-'));
  const filePath = path.join(directory, 'sample.txt');
  try {
    await writeFile(filePath, '');
    return await analyzeDocumentRisk(filePath, 'sample.txt', documentName);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('classifies an Aadhaar document name as high risk without extracted text', async () => {
  const result = await analyzeNamedDocument('Sample Aadhar Card');

  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.riskScore >= 85);
  assert.ok(result.sensitiveInfo.includes('Aadhaar / Government ID'));
  assert.equal(result.riskAssessmentMethod, 'ML_DECISION_TREE');
  assert.equal(result.riskFeatures.aadhaar, 1);
  assert.equal(result.riskFeatures.extractionFailed, 0);
  assert.equal(result.riskFeatures.fileText, 1);
});

test('classifies a bank statement name as high risk without extracted text', async () => {
  const result = await analyzeNamedDocument('Sample Bank Statement');

  assert.equal(result.riskLevel, 'HIGH');
  assert.ok(result.riskScore >= 85);
  assert.ok(result.sensitiveInfo.includes('Bank & Financial Details'));
});

test('classifies a PAN card with identity details as high risk', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'secureshare-pan-'));
  const filePath = path.join(directory, 'identity.txt');
  try {
    await writeFile(
      filePath,
      'Name: Sample Person\nDate of Birth: 01/01/1990\nPermanent Account Number: ABCDE1234F',
    );

    const result = await analyzeDocumentRisk(filePath, 'identity.txt', 'PAN Card');

    assert.equal(result.riskLevel, 'HIGH');
    assert.ok(result.riskScore >= 75);
    assert.equal(result.riskFeatures.pan, 1);
    assert.equal(result.riskFeatures.dateOfBirth, 1);
    assert.ok(result.sensitiveInfo.includes('PAN Number'));
    assert.ok(result.sensitiveInfo.includes('Name'));
    assert.ok(result.sensitiveInfo.includes('Date of Birth'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('keeps a generic document without sensitive indicators at low risk', async () => {
  const result = await analyzeNamedDocument('Sample Notes');

  assert.equal(result.riskLevel, 'LOW');
});

test('OCR detects Aadhaar, mobile, date of birth, and address labels in an image', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'secureshare-ocr-'));
  const filePath = path.join(directory, 'scan.png');
  try {
    await writeFile(filePath, await createSyntheticIdImage().encode('png'));

    const result = await analyzeDocumentRisk(filePath, 'scan.png', 'Unrelated Filename');

    assert.equal(result.riskLevel, 'HIGH');
    assert.ok(result.sensitiveInfo.includes('Aadhaar Number'));
    assert.ok(result.sensitiveInfo.includes('Mobile / Phone Number'));
    assert.ok(result.sensitiveInfo.includes('Date of Birth'));
    assert.ok(result.sensitiveInfo.includes('Residential Address'));
    assert.doesNotMatch(result.extractedSummary, /9999|01\/01\/2000/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('OCR detects sensitive labels in a scanned PDF', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'secureshare-pdf-ocr-'));
  const filePath = path.join(directory, 'scan.pdf');
  try {
    const jpeg = await createSyntheticIdImage().encode('jpeg');
    await writeFile(filePath, createImagePdf(jpeg));

    const result = await analyzeDocumentRisk(filePath, 'scan.pdf', 'Unrelated Filename');

    assert.equal(result.riskLevel, 'HIGH');
    assert.ok(result.sensitiveInfo.includes('Aadhaar Number'));
    assert.ok(result.sensitiveInfo.includes('Date of Birth'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('does not classify an image as low risk when OCR cannot extract text', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'secureshare-ocr-'));
  const filePath = path.join(directory, 'empty.png');
  try {
    const canvas = createCanvas(400, 200);
    await writeFile(filePath, await canvas.encode('png'));

    const result = await analyzeDocumentRisk(filePath, 'empty.png', 'Generic Scan');

    assert.equal(result.riskLevel, 'HIGH');
    assert.equal(result.riskScore, 90);
    assert.equal(result.aiConfidence, 0);
    assert.ok(result.sensitiveInfo.includes('Text Extraction Failed - Manual Review Required'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('runs a trained decision tree against boolean risk features', () => {
  const model = {
    modelVersion: 1,
    featureNames: ['aadhaar'],
    classes: ['HIGH', 'LOW', 'MEDIUM'],
    root: 0,
    nodes: [
      { feature: 0, threshold: 0.5, left: 1, right: 2, values: [0, 0, 0] },
      { feature: null, threshold: null, left: null, right: null, values: [0, 10, 0] },
      { feature: null, threshold: null, left: null, right: null, values: [8, 1, 1] },
    ],
  };

  assert.deepEqual(
    predictWithDecisionTree({ aadhaar: 0 }, model),
    { riskLevel: 'LOW', riskScore: 20, aiConfidence: 100 }
  );
  assert.deepEqual(
    predictWithDecisionTree({ aadhaar: 1 }, model),
    { riskLevel: 'HIGH', riskScore: 76, aiConfidence: 80 }
  );
});


