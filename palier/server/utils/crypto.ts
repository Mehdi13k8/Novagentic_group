import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const { encryptionKey } = useRuntimeConfig()
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not set — generate one with: openssl rand -base64 32')
  }
  const key = Buffer.from(encryptionKey, 'base64')
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must decode to exactly 32 bytes — generate with: openssl rand -base64 32')
  }
  return key
}

/**
 * Encrypts a secret (a landlord's Rentila client_secret, a Bridge token,
 * anything per-tenant) for storage at rest. AES-256-GCM, random IV per call,
 * output is `base64(iv || authTag || ciphertext)` — self-contained, nothing
 * else needs to be stored alongside it besides ENCRYPTION_KEY itself.
 */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

export function decryptSecret(payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
