import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let db: ReturnType<typeof client.db>;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db();
  }
  return db;
}