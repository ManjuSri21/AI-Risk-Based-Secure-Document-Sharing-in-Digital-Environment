import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEncryptedKeyRecord,
  decryptKeyMaterial,
} from '../services/adminKeyService.js';

test('encrypts generated admin key material and decrypts it with the configured master secret', () => {
  const originalSecret = process.env.ADMIN_MASTER_KEY;
  process.env.ADMIN_MASTER_KEY = 'test-only-admin-master-secret-long-enough';

  try {
    const record = createEncryptedKeyRecord('admin-user-id');
    const keyMaterial = decryptKeyMaterial(record);

    assert.match(keyMaterial, /^[0-9a-f]{64}$/);
    assert.notEqual(record.encryptedKeyMaterial, keyMaterial);
    assert.equal(record.algorithm, 'AES-256');
  } finally {
    if (originalSecret === undefined) delete process.env.ADMIN_MASTER_KEY;
    else process.env.ADMIN_MASTER_KEY = originalSecret;
  }
});

test('rejects key generation without a configured master secret', () => {
  const originalSecret = process.env.ADMIN_MASTER_KEY;
  delete process.env.ADMIN_MASTER_KEY;

  try {
    assert.throws(
      () => createEncryptedKeyRecord('admin-user-id'),
      /ADMIN_MASTER_KEY must be configured/
    );
  } finally {
    if (originalSecret !== undefined) process.env.ADMIN_MASTER_KEY = originalSecret;
  }
});
