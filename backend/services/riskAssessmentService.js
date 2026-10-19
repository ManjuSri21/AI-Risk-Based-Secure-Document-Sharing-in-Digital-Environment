import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import pdfParse from 'pdf-parse';
import { createCanvas, DOMMatrix, ImageData, loadImage, Path2D } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker, OEM } from 'tesseract.js';

const require = createRequire(import.meta.url);
const englishModel = require('@tesseract.js-data/eng');
const OCR_CACHE_PATH = path.join(os.tmpdir(), 'secureshare-ocr-cache');
const MODEL_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ml', 'risk_model.json');
const MAX_OCR_PDF_PAGES = 5;
const MAX_OCR_IMAGE_DIMENSION = 1400;

export const RISK_FEATURE_NAMES = [
  'aadhaar',
  'pan',
  'financial',
  'email',
  'phone',
  'dateOfBirth',
  'address',
  'student',
  'medical',
  'compensation',
  'extractionFailed',
  'filePdf',
  'fileImage',
  'fileText',
  'fileWord',
];

let ocrWorkerPromise;

globalThis.DOMMatrix ||= DOMMatrix;
globalThis.ImageData ||= ImageData;
globalThis.Path2D ||= Path2D;

const getOcrWorker = () => {
  ocrWorkerPromise ||= createWorker('eng', OEM.LSTM_ONLY, {
    langPath: englishModel.langPath,
    gzip: englishModel.gzip,
    cachePath: OCR_CACHE_PATH,
    cacheMethod: 'write',
  }).catch((error) => {
    ocrWorkerPromise = null;
    throw error;
  });
  return ocrWorkerPromise;
};

export const closeOcrWorker = async () => {
  if (!ocrWorkerPromise) return;
  const worker = await ocrWorkerPromise;
  ocrWorkerPromise = null;
  await worker.terminate();
};

const recognizeImage = async (image) => {
  const worker = await getOcrWorker();
  let imageToRecognize = image;

  if (typeof image === 'string') {
    const loadedImage = await loadImage(image);
    const scale = Math.min(1, MAX_OCR_IMAGE_DIMENSION / Math.max(loadedImage.width, loadedImage.height));
    if (scale < 1) {
      const canvas = createCanvas(
        Math.max(1, Math.round(loadedImage.width * scale)),
        Math.max(1, Math.round(loadedImage.height * scale))
      );
      canvas.getContext('2d').drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
      imageToRecognize = await canvas.encode('png');
    }
  }

  const { data } = await worker.recognize(imageToRecognize, {
    tessedit_pageseg_mode: '6',
  });
  return data.text || '';
};

const recognizePdfPages = async (buffer) => {
  const document = await getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;
  const pageTexts = [];

  try {
    const pageCount = Math.min(document.numPages, MAX_OCR_PDF_PAGES);
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const initialViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, MAX_OCR_IMAGE_DIMENSION / Math.max(initialViewport.width, initialViewport.height));
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;
      pageTexts.push(await recognizeImage(await canvas.encode('png')));
      page.cleanup();
    }
  } finally {
    await document.destroy();
  }

  return pageTexts.join('\n');
};

const extractDocumentText = async (filePath, originalName) => {
  const extension = path.extname(originalName || filePath).toLowerCase();
  if (extension === '.txt') {
    return { text: await fs.promises.readFile(filePath, 'utf-8'), status: 'text-extracted' };
  }

  if (['.png', '.jpg', '.jpeg'].includes(extension)) {
    const text = await recognizeImage(filePath);
    return { text, status: text.trim() ? 'ocr' : 'unreadable' };
  }

  if (extension === '.pdf') {
    const buffer = await fs.promises.readFile(filePath);
    let nativeText = '';
    try {
      const pdfData = await pdfParse(buffer);
      nativeText = pdfData.text || '';
    } catch (error) {
      console.warn('[Document Text Extraction] Native PDF text extraction failed; attempting local OCR.');
    }

    if (nativeText.replace(/\s/g, '').length >= 40) {
      return { text: nativeText, status: 'text-extracted' };
    }

    const ocrText = await recognizePdfPages(buffer);
    return { text: `${nativeText}\n${ocrText}`, status: ocrText.trim() ? 'ocr' : 'unreadable' };
  }

  return { text: '', status: 'unsupported' };
};

const inferDocumentType = (rawContent, originalName = '') => {
  const text = `${originalName} ${rawContent}`.toLowerCase();
  if (/\b(?:aadhaar|aadhar|uidai)\b/i.test(text)) return 'Aadhaar Card';
  if (/\b(?:pan[\s_-]*(?:card|number)|permanent\s+account\s+number)\b/i.test(text)) return 'PAN Card';
  if (/\b(?:passport)\b/i.test(text)) return 'Passport';
  if (/\b(?:bank[\s_-]*(?:statement|passbook)|statement[\s_-]*of[\s_-]*account|account[\s_-]*statement)\b/i.test(text)) return 'Bank Statement';
  if (/\b(?:salary|payslip|payroll)\b/i.test(text)) return 'Salary Slip';
  if (/\b(?:medical|prescription|diagnosis|hospital|clinical|doctor)\b/i.test(text)) return 'Medical Report';
  if (/\b(?:marksheet|mark\s*sheet|transcript|grade\s*card|student\s*id|roll\s*number)\b/i.test(text)) return 'Marksheet / Academic Record';
  return 'General Document';
};

const extractFeaturesAndEntities = (rawContent) => {
  const entities = [];
  const features = Object.fromEntries(RISK_FEATURE_NAMES.map((name) => [name, 0]));

  const aadhaarNumber = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(rawContent);
  const aadhaarLabel = /\b(?:aadhaar|aadhar|uidai|unique\s+identification\s+authority)\b/i.test(rawContent);
  if (aadhaarNumber || aadhaarLabel) {
    features.aadhaar = 1;
    entities.push(aadhaarNumber ? 'Aadhaar Number' : 'Aadhaar / Government ID');
  }

  const panNumber = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i.test(rawContent);
  const panLabel = /\b(?:pan[\s_-]*(?:card|number|no\.?)|permanent\s+account\s+number)\b/i.test(rawContent);
  if (panNumber || panLabel) {
    features.pan = 1;
    entities.push('PAN Number');
  }

  const ifscCode = /\b[A-Z]{4}0[A-Z0-9]{6}\b/i.test(rawContent);
  const cardNumber = /\b(?:\d{4}[-\s]?){3}\d{4}\b/.test(rawContent);
  const financialLabel = /\b(?:bank[\s_-]*(?:statement|account|passbook)|account[\s_-]*statement|statement[\s_-]*of[\s_-]*account|account[\s_-]*(?:number|no\.?)|transaction|balance|ifsc|cvv)\b/i.test(rawContent);
  if (ifscCode || cardNumber || financialLabel) {
    features.financial = 1;
    entities.push('Bank & Financial Details');
  }

  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(rawContent);
  if (email) {
    features.email = 1;
    entities.push('Email Address');
  }

  const nameLabel = /(?:^|\s|\b)(?:full\s*name|name(?:\s+of\s+(?:the\s+)?(?:applicant|holder|cardholder|employee|student))?|applicant\s*name|holder\s*name|candidate\s*name|father(?:'s)?\s*name|mother(?:'s)?\s*name)\s*[:\-]?\s*\S/im.test(rawContent)
    || (/\bname\b/i.test(rawContent) && (features.pan || features.aadhaar || features.student))
    || Boolean(features.pan || features.aadhaar);
  if (nameLabel) {
    entities.push('Name');
  }

  const phoneNumber = /(?:\+?91[\s-]?)?[6-9]\d{9}\b/.test(rawContent)
    || /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(rawContent);
  const phoneLabel = /\b(?:mobile|phone|telephone|contact)\s*(?:number|no\.?|#)\b/i.test(rawContent);
  if (phoneNumber || phoneLabel) {
    features.phone = 1;
    entities.push('Mobile / Phone Number');
  }

  const hasDobKeyword = /\b(?:dob|d\.?o\.?b\.?|date\s+of\s+birth|birth\s+date|born|year\s+of\s+birth|yob)\b/i.test(rawContent);
  const hasDatePattern = /\b(?:0[1-9]|[12]\d|3[01])[/-](?:0[1-9]|1[0-2])[/-](?:19\d{2}|20\d{2})\b/.test(rawContent)
    || /\b(?:0[1-9]|[12]\d|3[01])\.(?:0[1-9]|1[0-2])\.(?:19\d{2}|20\d{2})\b/.test(rawContent);
  const dateOfBirth = hasDobKeyword || hasDatePattern || Boolean(features.pan || features.aadhaar);
  if (dateOfBirth) {
    features.dateOfBirth = 1;
    entities.push('Date of Birth');
  }

  if (features.pan && /\bfather\b/i.test(rawContent)) {
    entities.push("Father's Name");
  }

  const address = /\b(?:(?:permanent|residential|current|present)\s+)?address\b/i.test(rawContent)
    || /\b(?:house|street|village|district)\s*(?:name|no\.?|number|:)\b/i.test(rawContent);
  if (address || features.aadhaar) {
    features.address = 1;
    entities.push('Residential Address');
  }

  if (/\b(?:marksheet|mark\s*sheet|roll number|cgpa|student id|college id|grade card)\b/i.test(rawContent)) {
    features.student = 1;
    entities.push('Student Record / Academic ID');
  }

  if (/\b(?:medical|prescription|diagnosis|hospital|clinical|patient)\b/i.test(rawContent)) {
    features.medical = 1;
    entities.push('Medical Information');
  }

  if (/\b(?:salary|payroll|payslip|compensation|remuneration|confidential|internal only)\b/i.test(rawContent)) {
    features.compensation = 1;
    entities.push('Confidential / Compensation Info');
  }

  const uniqueEntities = [...new Set(entities)];
  return { sensitiveInfo: uniqueEntities, features };
};

export const predictWithDecisionTree = (features, model) => {
  if (
    model?.modelVersion !== 1 ||
    !Array.isArray(model.featureNames) ||
    !Array.isArray(model.classes) ||
    !Array.isArray(model.nodes) ||
    !model.nodes.length
  ) {
    throw new Error('Trained risk model has an unsupported or invalid format');
  }

  let nodeIndex = model.root ?? 0;
  for (let steps = 0; steps <= model.nodes.length; steps += 1) {
    const node = model.nodes[nodeIndex];
    if (!node) throw new Error('Trained risk model contains an invalid tree reference');

    if (node.feature === null) {
      if (!Array.isArray(node.values) || node.values.length !== model.classes.length) {
        throw new Error('Trained risk model has invalid leaf values');
      }
      const total = node.values.reduce((sum, value) => sum + value, 0);
      if (!Number.isFinite(total) || total <= 0) {
        throw new Error('Trained risk model has an empty leaf');
      }
      const probabilities = node.values.map((value) => value / total);
      const predictedIndex = probabilities.indexOf(Math.max(...probabilities));
      const riskLevel = model.classes[predictedIndex];
      const riskValue = { LOW: 20, MEDIUM: 55, HIGH: 85 }[riskLevel];
      if (riskValue === undefined) throw new Error('Trained risk model contains an unknown risk class');
      const riskScore = Math.round(
        probabilities.reduce((score, probability, index) => {
          const levelScore = { LOW: 20, MEDIUM: 55, HIGH: 85 }[model.classes[index]];
          if (levelScore === undefined) throw new Error('Trained risk model contains an unknown risk class');
          return score + probability * levelScore;
        }, 0)
      );
      return {
        riskLevel,
        riskScore,
        aiConfidence: Math.round(probabilities[predictedIndex] * 100),
      };
    }

    const featureName = model.featureNames[node.feature];
    if (!RISK_FEATURE_NAMES.includes(featureName)) {
      throw new Error('Trained risk model references an unknown feature');
    }
    const value = features[featureName];
    if (!Number.isFinite(value) || !Number.isFinite(node.threshold)) {
      throw new Error('Risk model received invalid feature values');
    }
    nodeIndex = value <= node.threshold ? node.left : node.right;
  }
  throw new Error('Trained risk model contains a tree cycle');
};

const loadTrainedModel = async () => {
  try {
    const rawModel = await fs.promises.readFile(MODEL_PATH, 'utf8');
    return JSON.parse(rawModel);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

export const analyzeDocumentRisk = async (filePath, originalName, documentName = originalName) => {
  let extractedText = '';
  let extractionStatus = 'unavailable';

  try {
    const extracted = await extractDocumentText(filePath, originalName);
    extractedText = extracted.text;
    extractionStatus = extracted.status;
  } catch (error) {
    console.error('[Document Text Extraction Error]', error.code || error.name);
    extractionStatus = 'unavailable';
  }

  const { sensitiveInfo, features } = extractFeaturesAndEntities(
    `${originalName} ${documentName} ${extractedText}`
  );

  const extractionFailed = ['unavailable', 'unsupported', 'unreadable'].includes(extractionStatus);
  features.extractionFailed = Number(extractionFailed);
  const extension = path.extname(originalName || filePath).toLowerCase();
  features.filePdf = Number(extension === '.pdf');
  features.fileImage = Number(['.png', '.jpg', '.jpeg'].includes(extension));
  features.fileText = Number(extension === '.txt');
  features.fileWord = Number(['.doc', '.docx'].includes(extension));

  if (extractionFailed) {
    sensitiveInfo.push('Text Extraction Failed - Manual Review Required');
  }

  const documentType = inferDocumentType(extractedText, `${originalName} ${documentName}`);

  let predictedRisk = 'LOW';
  let modelScore = 20;
  let aiConfidence = 85;
  let modelVersion = 1;
  let riskAssessmentMethod = 'ML_DECISION_TREE';

  if (extractionFailed) {
    predictedRisk = 'HIGH';
    modelScore = 90;
    aiConfidence = 0;
    riskAssessmentMethod = 'POLICY_FALLBACK';
  } else {
    const model = await loadTrainedModel();
    if (model) {
      const prediction = predictWithDecisionTree(features, model);
      predictedRisk = prediction.riskLevel;
      modelScore = prediction.riskScore;
      aiConfidence = prediction.aiConfidence;
      modelVersion = model.modelVersion || 1;
      riskAssessmentMethod = 'ML_DECISION_TREE';
    } else {
      // Conservative baseline when model artifact is missing
      const hasCritical = features.aadhaar || features.pan || features.financial || features.medical;
      predictedRisk = hasCritical ? 'HIGH' : sensitiveInfo.length ? 'MEDIUM' : 'LOW';
      modelScore = predictedRisk === 'HIGH' ? 85 : predictedRisk === 'MEDIUM' ? 55 : 20;
      aiConfidence = 70;
      riskAssessmentMethod = 'RULES';
    }
  }

  // Security policy enforcement: Critical government identifiers (Aadhaar, PAN)
  // or financial passbook details enforce HIGH security with documented override
  let finalRisk = predictedRisk;
  let finalScore = modelScore;
  let policyReason = `Classified as ${predictedRisk} based on trained Decision Tree risk model (v${modelVersion}).`;

  const criticalAadhaar = features.aadhaar === 1;
  const criticalPan = features.pan === 1;
  const criticalFinancial = features.financial === 1;

  if (criticalAadhaar || criticalPan || criticalFinancial) {
    if (predictedRisk !== 'HIGH') {
      finalRisk = 'HIGH';
      finalScore = Math.max(modelScore, 88);
      const identifiers = [
        criticalAadhaar ? 'Aadhaar' : null,
        criticalPan ? 'PAN' : null,
        criticalFinancial ? 'Financial Account' : null,
      ].filter(Boolean).join(' & ');
      policyReason = `Enforced policy override to HIGH: Critical identifier (${identifiers}) detected requiring maximum security controls.`;
    } else {
      policyReason = `Trained Decision Tree predicted HIGH risk, confirmed by critical security policy.`;
    }
  } else if (extractionFailed) {
    finalRisk = 'HIGH';
    finalScore = 90;
    policyReason = 'Conservative security policy applied: unreadable or unsupported file requires manual review.';
  }

  const extractedSummary = extractionFailed
    ? 'Text could not be extracted. Document classified as high risk pending manual review.'
    : sensitiveInfo.length
      ? `Sensitive categories detected: ${sensitiveInfo.join(', ')}. Extracted document text is not stored.`
      : `Document text analyzed (${extractionStatus}). No configured sensitive data patterns were detected.`;

  return {
    documentType,
    predictedRisk,
    finalRisk,
    riskLevel: finalRisk,
    riskScore: finalScore,
    aiConfidence,
    modelVersion,
    policyReason,
    riskFeatures: features,
    riskAssessmentMethod,
    detectedEntities: sensitiveInfo,
    sensitiveInfo,
    extractedSummary,
  };
};
