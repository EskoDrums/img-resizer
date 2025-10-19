// api/saveTelegramId.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set in env");

let cachedClient = global._mongoClient || null;
if (!cachedClient) {
  cachedClient = new MongoClient(uri);
  global._mongoClient = cachedClient;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    await cachedClient.connect();
    const db = cachedClient.db("image_resizer_app");
    const col = db.collection("telegram_users");

    // store only userId and timestamp; deduplicate by userId
    const now = new Date();
    await col.updateOne(
      { userId: String(userId) },
      { $set: { userId: String(userId), lastSeen: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    return res.status(200).json({ ok: true, userId: String(userId) });
  } catch (err) {
    console.error("saveTelegramId error:", err);
    return res.status(500).json({ error: 'Server error' });
  }
}
