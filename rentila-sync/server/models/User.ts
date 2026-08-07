import { Schema } from 'mongoose'
import { coreDb } from '../utils/db'

export interface UserDoc {
  email: string
  // Hashed via nuxt-auth-utils' hashPassword() (scrypt under the hood) —
  // never store or log a plaintext password.
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

export const User = coreDb.models.User || coreDb.model<UserDoc>('User', userSchema)
