import crypto from 'crypto';

const getMasterSecret = () => {
  const configuredSecret = process.env.ADMIN_MASTER_KEY;
  if (!configuredSecret || configuredSecret.length < 32) {
    throw new Error('ADMIN_MASTER_KEY must be configured with at least 32 characters.');
  }
  return crypto.createHash('sha256').update(configuredSecret).digest();
};

export const generateKeyId = () => {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `AES-256-${Date.now()}-${randomPart}`;
};

export const createEncryptedKeyRecord = (userId, reason = 'Routine rotation') => {
  const keyMaterial = crypto.randomBytes(32).toString('hex');
  const key = getMasterSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(keyMaterial, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    keyId: generateKeyId(),
    algorithm: 'AES-256',
    encryptedKeyMaterial: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    createdBy: userId,
    reason,
    rotatedAt: new Date(),
  };
};

export const decryptKeyMaterial = ({ encryptedKeyMaterial, iv, authTag }) => {
  const key = getMasterSecret();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedKeyMaterial, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};
