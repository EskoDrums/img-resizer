// api/getUsers.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const ADMIN_KEY = process.env.ADMIN_KEY || "1997";
if (!uri) throw new Error("MONGODB_URI not set");

let cachedClient = global._mongoClient || null;
if (!cachedClient) {
  cachedClient = new MongoClient(uri);
  global._mongoClient = cachedClient;
}

export default async function handler(req, res) {
  // Protect with admin key header 'x-admin-key'
  const provided = req.headers['x-admin-key'] || '';
  if (!provided || provided !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await cachedClient.connect();
    const db = cachedClient.db("image_resizer_app");
    const col = db.collection("telegram_users");

    const docs = await col.find({}, { projection: { _id: 0, userId: 1, createdAt: 1, lastSeen: 1 } }).toArray();
    // return as array of objects
    return res.status(200).json({ users: docs });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ error: 'Server error' });
  }
}
