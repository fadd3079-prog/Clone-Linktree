import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
    throw new Error('Silakan tambahkan MONGODB_URI ke .env.local')
}

if (process.env.NODE_ENV === 'development') {
    // Dalam mode development, gunakan variabel global agar koneksi tidak berulang
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    // Dalam mode production (Vercel), buat koneksi baru
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

export default clientPromise