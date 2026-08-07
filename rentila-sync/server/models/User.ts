import { Schema } from 'mongoose'
import { coreDb } from '../utils/db'

export interface UserDoc {
  email: string
  // Hashed via nuxt-auth-utils' hashPassword() (scrypt under the hood) —
  // never store or log a plaintext password.
  passwordHash: string
  // Password reset: store a SHA-256 hash of the raw token (sent to the
  // user, never persisted) — plain hashing is fine here unlike passwords,
  // since the token is high-entropy random, not something to brute-force
  // via a dictionary. Cleared after use or expiry.
  resetTokenHash?: string
  resetTokenExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
)

export const User = coreDb.models.User || coreDb.model<UserDoc>('User', userSchema)
