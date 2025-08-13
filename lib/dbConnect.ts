import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

// Cache the mongoose connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}
declare global {
  var mongoose: MongooseCache | undefined;
}
let cached = global.mongoose;

// Initialize the cache if it doesn't exist
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connect to the database
async function dbConnect() {
  // If the connection is already established, return the cached connection
  if (cached?.conn) {
    return cached.conn;
  }

  // Create a new promise if it doesn't exist
  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    // If the cache is not initialized, throw an error
    if (!cached) {
      throw new Error("Failed to initialize mongoose connection cache");
    }

    // Connect to the database
    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
