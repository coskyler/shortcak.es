import express from "express";
import { connectDB } from "../db";
import { LinkRedirect } from "../types/docTypes";

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

    return res.redirect(302, doc.target);

  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Internal server error");
  }
});


export default router;
