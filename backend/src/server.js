import express from "express";
import linksRouter from "./routes/links.js";
import analyticsRouter from "./routes/analytics.js";
import aggregatesRouter from "./routes/aggregates.js";
import redirectRouter from "./routes/redirect.js";

const app = express();
app.use(express.json());

app.use("/api/links", linksRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/aggregates", aggregatesRouter);
app.use("/r", redirectRouter);

app.listen(80);
export default app;
