import express from 'express';
const router = express.Router();

router.get("/:slug", async (req, res) => {
    console.log('redirecting');
    res.status(302).send("This is a redirect via: " + req.params.slug);
})

export default router;