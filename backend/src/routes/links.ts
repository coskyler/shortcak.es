// links.ts
import express from "express";
import { connectDB } from "../db";
import { LinkRedirect, LinkAnalytics, DailyClick, ClickLog, UserAnalytics } from "../types/docTypes"; // Import UserAnalytics

const router = express.Router();

// GET /api/links - Get all links for the logged-in user
router.get("/", async (req: any, res) => {
    try {
        const uid: string = req.uid!; // Get user ID from auth

        const db = await connectDB();
        const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

        // Find all links where uid matches and deleted is false
        const links = await linkRedirects
            .find(
                { uid, deleted: false },
                { projection: { uid: 0 } } // Don't return the uid in the list
            )
            .sort({ createDate: -1 }) // Show newest first
            .toArray();

        return res.json(links);
    } catch (err) {
        console.error("Error fetching links:", err);
        return res.status(500).json({ error: "Failed to fetch links" });
    }
});


// POST /api/links - Create a new link
router.post("/", async (req: any, res) => {
    try {
        const uid: string = req.uid!;

        const { redirect, name, slug } = req.body as {
            redirect?: string;
            name?: string;
            slug?: string;
        };

        if (!redirect || !name) {
            return res.status(400).json({ error: "Missing redirect or name" });
        }

        //validate url
        try {
            new URL(redirect);
        } catch {
            return res.status(400).json({ error: "Invalid URL" });
        }

        const db = await connectDB();
        const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

        // helper to generate a slug candidate
        function randomSlug(len = 6) {
            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let out = "";
            for (let i = 0; i < len; i++) {
                out += chars[Math.floor(Math.random() * chars.length)];
            }
            return out;
        }

        // helper to ensure slug is unique
        async function generateUniqueSlug(): Promise<string> {
            while (true) {
                const candidate = randomSlug();
                const existing = await linkRedirects.findOne({ _id: candidate });
                if (!existing) return candidate;
            }
        }

        let finalSlug = slug?.trim();

        if (finalSlug) {
            //validate slug (allows alphanumeric characters and hyphens)
            if (!/^[A-Za-z0-9-]+$/.test(finalSlug)) {
                return res.status(400).json({ error: "Slug must contain only letters, numbers, or hyphens" });
            }

            // verify provided slug does not exist
            const existing = await linkRedirects.findOne({ _id: finalSlug });
            if (existing) {
                return res.status(409).json({ error: "Slug already in use" });
            }
        } else {
            // generate a unique slug
            finalSlug = await generateUniqueSlug();
        }

        const doc: LinkRedirect = {
            _id: finalSlug,
            uid,
            target: redirect,
            name,
            createDate: new Date(),
            deleted: false,
        };

        await linkRedirects.insertOne(doc);


        const userAnalytics = db.collection<UserAnalytics>("userAnalytics");
        await userAnalytics.updateOne(
            { _id: uid },
            { $inc: { totalLinks: 1 } }, // Increment total links
            { upsert: true } // Create the doc if it doesn't exist
        );

        return res.status(201).json(doc);

    } catch (err) {
        console.error("Error creating link:", err);
        return res.status(500).json({ error: "Failed to create link" });
    }
});


// PATCH /api/links - Update a link's name
router.patch("/", async (req: any, res) => {
    try {
        const uid: string = req.uid!;
        const { slug, name } = req.body as {
            slug?: string;
            name?: string;
        };

        // Check for required fields
        if (!slug || !name) {
            return res.status(400).json({ error: "Missing slug or name" });
        }

        const db = await connectDB();
        const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

        // Find the link by its slug AND the user's ID, and update its name
        const result = await linkRedirects.updateOne(
            { _id: slug, uid, deleted: false }, // Filter: must own link and not be deleted
            { $set: { name: name } } // Update only the name
        );

        // If no document matched, it's not found, or not owned by user
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Link not found or unauthorized" });
        }

        // Return the newly updated document
        const updatedDoc = await linkRedirects.findOne({ _id: slug, uid });
        return res.status(200).json(updatedDoc);

    } catch (err) {
        console.error("Error updating link:", err);
        return res.status(500).json({ error: "Failed to update link" });
    }
});

// DELETE /api/links - "Soft delete" a link
router.delete("/", async (req: any, res) => {
    try {
        const { slug } = req.body as { slug?: string }; // Get slug from body
        const uid: string = req.uid!;

        if (!slug) {
            return res.status(400).json({ error: "Missing slug" });
        }

        const db = await connectDB();
        const linkRedirects = db.collection<LinkRedirect>("linkRedirects");

        // First, find the link to make sure it exists and isn't already deleted
        const existingLink = await linkRedirects.findOne(
            { _id: slug, uid },
            { projection: { deleted: 1 } }
        );

        // Not found or not owned by user
        if (!existingLink) {
            return res.status(404).json({ error: "Link not found or unauthorized" });
        }

        // Only update counts if it's not already deleted
        if (existingLink.deleted === false) {
            // Decrement the user's total link count
            const userAnalytics = db.collection<UserAnalytics>("userAnalytics");
            await userAnalytics.updateOne(
                { _id: uid },
                { $inc: { totalLinks: -1 } }, // Decrement total links
                { upsert: true }
            );
        }

        // Perform the "soft delete" by setting deleted: true
        // We don't actually remove it from the database
        await linkRedirects.updateOne(
            { _id: slug, uid }, // Filter: Match slug AND owner UID
            { $set: { deleted: true } } // Update
        );

        return res.status(200).json({ message: "Link deleted" });

    } catch (err) {
        console.error("Error deleting link:", err);
        return res.status(500).json({ error: "Failed to delete link" });
    }
});

export default router;