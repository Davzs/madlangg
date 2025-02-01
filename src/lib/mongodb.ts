import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      cached.promise = mongoose
        .connect(MONGODB_URI!, opts)
        .then((mongoose) => {
          console.log('Connected to MongoDB');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error:', error);
          cached.promise = null;
          throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    cached.promise = null;
    throw error;
  }
}

// Export the connection function with the name that's being imported
export const connectToDatabase = dbConnect;

// Gracefully close the MongoDB connection when the app is shutting down
process.on('SIGTERM', async () => {
  if (cached.conn) {
    await cached.conn.disconnect();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

export default dbConnect;
