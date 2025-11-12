import express from "express";
import linksRouter from "./routes/links";
import analyticsRouter from "./routes/analytics";
import aggregatesRouter from "./routes/aggregates";
import redirectRouter from "./routes/redirect";

const app = express();
app.use(express.json());

app.use("/api/links", linksRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/aggregates", aggregatesRouter);
app.use("/r", redirectRouter);

app.listen(80);

export default app;
