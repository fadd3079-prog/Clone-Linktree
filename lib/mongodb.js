import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Silakan tambahkan MONGODB_URI ke .env.local');
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect().catch((err) => {
            console.error("MongoDB Atlas Initial Connect Warning:", err.message);
            // Allow retry rather than caching permanently rejected promise
            global._mongoClientPromise = null;
            throw err;
        });
    }
    clientPromise = global._mongoClientPromise || client.connect();
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;