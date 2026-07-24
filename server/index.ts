import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import env from "./config/env";
import db from "./config/db";
import { errorHandler } from "./middleware/error.middleware";

// REST routes
import authRoutes from "./rest/auth.routes";
import guestRoutes from "./rest/guest.routes";
import inviteRoutes from "./rest/invite.routes";
import attendeeRoutes from "./rest/attendee.routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- Security Middleware ----------
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

// ---------- Health Check ----------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------- REST Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/attendees", attendeeRoutes);

// ---------- Serve Frontend in Production ----------
if (env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.accepts("html")) {
      res.sendFile(path.join(clientDistPath, "index.html"));
    } else {
      next();
    }
  });
}

// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Start ----------
async function start() {
  console.log("🔥 Connecting to Firestore...");
  try {
    await db.collection("_connection_check").limit(1).get();
    console.log("🔥 Firestore connected successfully");
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║         Dear You Invites — Server           ║
║──────────────────────────────────────────────║
║  REST API : http://localhost:${env.PORT}/api  ║
║  Health   : http://localhost:${env.PORT}/api/health  ║
╚══════════════════════════════════════════════╝
    `);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
