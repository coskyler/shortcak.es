// aggregate.ts
import express from "express";
import { connectDB } from "../db";
import { UserAnalytics } from "../types/docTypes"; // Import the type

const router = express.Router();

// GET /api/aggregates
router.get("/", async (req: any, res) => {
    try {
        const uid: string = req.uid!; // Get the user's ID from the auth middleware

        const db = await connectDB();
        const userAnalytics = db.collection<UserAnalytics>("userAnalytics");

        // Find the analytics document for this user
        const analytics = await userAnalytics.findOne({ _id: uid });

        // If the user has no analytics yet, return a default object
        if (!analytics) {
            return res.json({
                _id: uid,
                totalLinks: 0,
                totalClicks: 0,
                clicksByRegion: {},
                clicksByDevice: {},
            });
        }

        // Otherwise, return what we found
        return res.json(analytics);

    } catch (err) {
        console.error("Error fetching aggregate analytics:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;