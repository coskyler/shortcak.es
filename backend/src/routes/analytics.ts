import express from "express";
import { connectDB } from "../db";
import { ClickLog, LinkAnalytics, DailyClick, LinkRedirect } from "../types/docTypes";

const router = express.Router();

export async function verifyLinkOwnership(slug: string, uid: string) {
  const db = await connectDB();
  const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

  const doc = await linkRedirects.findOne(
    { _id: slug, uid },
    { projection: { _id: 1, uid: 1, name: 1, target: 1, deleted: 1 } }
  );

  if (!doc || doc.deleted) return null;
  return doc;
}

// all daily click history for this link
router.get("/:slug/clicksbyday", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const dailyClicks = db.collection<DailyClick>("dailyClicks");

    const docs = await dailyClicks
      .find({ link: slug })
      .sort({ date: 1 })
      .toArray();

    return res.json(docs);
  } catch (err) {
    console.error("clicksbyday error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// clicks by country
router.get("/:slug/clicksbycountry", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");

    const analytics = await linkAnalytics.findOne(
      { _id: slug },
      { projection: { clicksByRegion: 1, _id: 0 } }
    );

    return res.json(analytics?.clicksByRegion || {});
  } catch (err) {
    console.error("clicksbycountry error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// clicks by device
router.get("/:slug/clicksbydevice", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");

    const analytics = await linkAnalytics.findOne(
      { _id: slug },
      { projection: { clicksByDevice: 1, _id: 0 } }
    );

    return res.json(analytics?.clicksByDevice || {});
  } catch (err) {
    console.error("clicksbydevice error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// clicks by referrer
router.get("/:slug/clicksbyreferrer", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");

    const analytics = await linkAnalytics.findOne(
      { _id: slug },
      { projection: { clicksByReferrer: 1, _id: 0 } }
    );

    return res.json(analytics?.clicksByReferrer || {});
  } catch (err) {
    console.error("clicksbyreferrer error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// click logs for this link
router.get("/:slug/clicks", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const clickLogs = db.collection<ClickLog>("clickLogs");

    const logs = await clickLogs
      .find({ link: slug })
      .sort({ timeStamp: -1 })
      .toArray();

    return res.json(logs);
  } catch (err) {
    console.error("clicks error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// name, total and unique clicks for this link
router.get("/:slug/metrics", async (req: any, res) => {
  try {
    const { slug } = req.params;

    const ownerDoc = await verifyLinkOwnership(slug, req.uid);

    if (!ownerDoc) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    const db = await connectDB();
    const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");

    const analytics = await linkAnalytics.findOne(
      { _id: slug },
      { projection: { totalClicks: 1, uniqueClicks: 1 } }
    );

    return res.json({
      name: ownerDoc.name ?? null,
      totalClicks: analytics?.totalClicks ?? 0,
      uniqueClicks: analytics?.uniqueClicks ?? 0,
    });
  } catch (err) {
    console.error("metrics error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;