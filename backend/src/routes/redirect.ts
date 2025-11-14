import express from "express";
import { connectDB } from "../db";
import { LinkRedirect, ClickLog, LinkAnalytics, DailyClick, UserAnalytics } from "../types/docTypes";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const db = await connectDB();
    const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

    const doc = await linkRedirects.findOne({ _id: slug });

    if (!doc || doc.deleted) {
      return res.status(404).send("Link not found");
    }

    res.cookie(`u_${slug}`, "1", {
      path: `/r/${slug}`,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax"
    });

    res.redirect(302, doc.target);

    //process analytics after redirecting
    (async () => {
      try {
        const clickLogs = db.collection<ClickLog>("clickLogs");
        const linkAnalytics = db.collection<LinkAnalytics>("linkAnalytics");
        const dailyClicks = db.collection<DailyClick>("dailyClicks");
        const userAnalytics = db.collection<UserAnalytics>("userAnalytics");

        const isUnique = !req.cookies[`u_${slug}`];

        const now = new Date();

        // get device, referrer, and ip
        const ua = req.get("user-agent") || "";
        const referrerHeader = req.get("referer") || req.get("referrer") || "";
        const ip =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          "";

        const region = "unknown"; // need to implement geolookup
        const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

        const referrerKey = (() => {
          if (!referrerHeader) return "";
          try {
            const u = new URL(referrerHeader);
            return u.hostname;
          } catch {
            return referrerHeader;
          }
        })();

        // append clickLogs
        await clickLogs.insertOne({
          timeStamp: now,
          link: slug,
          ip,
          country: region,
          ua,
          referrer: referrerHeader || undefined,
        });

        // update linkAnalytics
        const linkInc: Record<string, number> = {
          totalClicks: 1,
          uniqueClicks: isUnique ? 1 : 0,
          [`clicksByRegion.${region}`]: 1,
          [`clicksByDevice.${device}`]: 1,
        };
        if (referrerKey) {
          linkInc[`clicksByReferrer.${referrerKey}`] = 1;
        }

        await linkAnalytics.updateOne(
          { _id: slug },
          {
            $inc: linkInc,
          },
          { upsert: true }
        );

        // update dailyClicks
        const day = new Date(now);
        day.setUTCHours(0, 0, 0, 0); //remove hours/min/sec/ms

        await dailyClicks.updateOne(
          { link: slug, date: day },
          { $inc: { clicks: 1 } },
          { upsert: true }
        );

        // update userAnalytics
        const userInc: Record<string, number> = {
          totalClicks: 1,
          [`clicksByRegion.${region}`]: 1,
          [`clicksByDevice.${device}`]: 1,
        };

        await userAnalytics.updateOne(
          { _id: doc.uid },
          { $inc: userInc },
          { upsert: true }
        );
      } catch (err) {
        console.error("Analytics error:", err);
      }
    })();

  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Internal server error");
  }
});


export default router;
