import express from "express";
import { connectDB } from "../db";
import { ClickLog, LinkAnalytics, DailyClick, LinkRedirect } from "../types/docTypes";

const router = express.Router();

// all daily click history for this link
router.get("/:slug/clicksbyday", async (req, res) => {
  try {
    const { slug } = req.params;

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
router.get("/:slug/clicksbycountry", async (req, res) => {
  try {
    const { slug } = req.params;

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
router.get("/:slug/clicksbydevice", async (req, res) => {
  try {
    const { slug } = req.params;

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

// click logs for this link
router.get("/:slug/clicks", async (req, res) => {
  try {
    const { slug } = req.params;

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
router.get("/:slug/metrics", async (req, res) => {
  try {
    const { slug } = req.params;

    const db = await connectDB();
    const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");
    const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

    // get metrics
    const analytics = await linkAnalytics.findOne(
      { _id: slug },
      { projection: { totalClicks: 1, uniqueClicks: 1 } }
    );

    // get name
    const meta = await linkRedirects.findOne(
      { _id: slug },
      { projection: { name: 1 } }
    );

    return res.json({
      name: meta?.name ?? null,
      totalClicks: analytics?.totalClicks ?? 0,
      uniqueClicks: analytics?.uniqueClicks ?? 0,
    });
  } catch (err) {
    console.error("metrics error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;