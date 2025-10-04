import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment variables. MongoDB features will be disabled.')
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  w: 'majority'
}

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

if (process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized. Please set MONGODB_URI environment variable.')
  }
  const client = await clientPromise
  return client.db(process.env.MONGODB_DATABASE || 'cookie-licking-detector')
}
