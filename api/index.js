import app from '../server/app.js';
import { connectDb } from '../server/config/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/physion_raisemanagement';
    await connectDb(mongoUri);
    isConnected = true;
  }
  return app(req, res);
}