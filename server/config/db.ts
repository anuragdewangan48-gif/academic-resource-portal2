import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureDefaultUsersInMongo } from '../controllers/userController.js';

dotenv.config();

/**
 * Normalizes MongoDB connection string, ensuring database name exists
 */
function normalizeMongoUri(rawUri: string): string {
  let uri = rawUri.trim();
  // Strip outer quotes if accidentally added in environment variables
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  // If srv URI lacks a database name before query parameters or at end
  if (uri.startsWith('mongodb+srv://')) {
    const afterProtocol = uri.slice('mongodb+srv://'.length);
    const slashIndex = afterProtocol.indexOf('/');
    if (slashIndex === -1) {
      // e.g. mongodb+srv://user:pass@cluster.mongodb.net -> append /academic_portal?retryWrites=true&w=majority
      return `${uri}/academic_portal?retryWrites=true&w=majority`;
    }
    const pathAndQuery = afterProtocol.slice(slashIndex + 1);
    if (!pathAndQuery || pathAndQuery.startsWith('?')) {
      const queryPart = pathAndQuery.startsWith('?') ? pathAndQuery : '?retryWrites=true&w=majority';
      return `${uri.slice(0, 'mongodb+srv://'.length + slashIndex)}/academic_portal${queryPart}`;
    }
  }
  return uri;
}

/**
 * MongoDB connection helper using Mongoose
 * Gracefully attempts connection to MONGODB_URI.
 * In environments where a live MongoDB server is not yet configured,
 * it catches the error without terminating the Express process,
 * allowing the server to operate with clear status reporting.
 */
export async function connectDB(): Promise<void> {
  const envUri = process.env.MONGODB_URI;

  if (!envUri) {
    console.log('[Database Info] MONGODB_URI is not set. Operating with built-in in-memory caching for live preview.');
    return;
  }

  const uri = normalizeMongoUri(envUri);

  try {
    mongoose.set('strictQuery', true);
    console.log(`[Database] Connecting to MongoDB Atlas cluster...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`[Database] Successfully connected to MongoDB at ${mongoose.connection.host}`);
    // Auto-seed default users if database is newly initialized
    await ensureDefaultUsersInMongo();
  } catch (error: any) {
    console.warn(`[Database Warning] Could not establish live MongoDB connection: ${error.message}`);
    console.warn(`[Database Info] The backend will operate with demonstration in-memory caching for live preview.`);
    console.warn(`[Database Tip] If using MongoDB Atlas, ensure your cluster IP Access List allows 0.0.0.0/0 (anywhere) or your server IP.`);
  }

  // Handle runtime connection lifecycle events
  mongoose.connection.on('connected', () => {
    console.log('[Database] Mongoose connected to database cluster.');
  });

  mongoose.connection.on('error', (err) => {
    console.warn(`[Database] Mongoose runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[Database] Mongoose connection disconnected.');
  });
}

/**
 * Check if Mongoose currently has an active connection
 * 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
 */
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
