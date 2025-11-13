import express from "express";
import admin from "firebase-admin"
import cors from "cors";
import serviceAccount from "./serviceAccountKey.json"
import linksRouter from "./routes/links";
import analyticsRouter from "./routes/analytics";
import aggregatesRouter from "./routes/aggregates";
import redirectRouter from "./routes/redirect";


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const app = express();

//allow localhost for dev
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}

app.use(express.json());

// verify auth via firebase
app.use("/api", async (req: any, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);

  if (!match) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}); //

app.use("/api/links", linksRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/aggregates", aggregatesRouter);
app.use("/r", redirectRouter);

app.listen(80);

export default app;
