import mongoose from 'mongoose'

export default defineEventHandler(() => {
  return {
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
  }
})
