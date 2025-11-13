import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let db: Db | null = null;
let initialized = false

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db();
  }

  // initialize timeseries collection & indices
  if(!initialized) {
    await initDb(db);
    initialized = true;
  }

  return db;
}

async function initDb(db: Db) {
  // linkRedirects: index on uid
  await db.collection("linkRedirects").createIndex({ uid: 1 });

  // dailyClicks: unique (link + date)
  await db.collection("dailyClicks").createIndex(
    { link: 1, date: 1 },
    { unique: true }
  );

  // clickLogs time-series creation
  const exists = await db
    .listCollections({ name: "clickLogs" })
    .toArray();

  if (exists.length === 0) {
    await db.createCollection("clickLogs", {
      timeseries: {
        timeField: "timeStamp",
        metaField: "link",
        granularity: "seconds",
      },
    });
  }

  const clickLogs = db.collection("clickLogs");

  // clickLogs: index for querying by link + time
  await clickLogs.createIndex({ link: 1, timeStamp: 1 });

  // clickLogs: 7 day document TTL
  await clickLogs.createIndex(
    { timeStamp: 1 },
    { expireAfterSeconds: 7 * 24 * 60 * 60 }
  );
}