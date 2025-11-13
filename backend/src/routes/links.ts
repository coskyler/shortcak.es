import express from "express";
import { connectDB } from "../db";
import { LinkRedirect, LinkAnalytics, DailyClick, ClickLog } from "../types/docTypes";

const router = express.Router();

router.get("/", async (req, res) => { });

router.post("/", async (req, res) => {
  try {
    const uid: string = req.uid;

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

    return res.status(201).json(doc);

  } catch (err) {
    console.error("Error creating link:", err);
    return res.status(500).json({ error: "Failed to create link" });
  }

});

router.patch("/", async (req, res) => { });

router.delete("/", async (req, res) => { });

export default router;
