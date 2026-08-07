import { connectMongo } from '../utils/db'

export default defineNitroPlugin(async () => {
  await connectMongo()
  // eslint-disable-next-line no-console
  console.log('[mongo] connected')
})
