require("dotenv").config({ quiet: true }); // must run before anything reads process.env
const express = require("express");
const pool = require("./src/config/db");
const migrate = require("./migrations/migrate");

const authRoutes = require("./src/modules/auth/auth.routes");
const ownerRoutes = require("./src/modules/owners/owners.routes");
const roomRoutes = require("./src/modules/rooms/rooms.routes");
const bookingRoutes = require("./src/modules/bookings/bookings.routes");
// const paymentRoutes = require("./src/modules/payments/payments.routes");

// fail fast instead of signing tokens with `undefined`
for (const key of ["DATABASE_URL", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1); // behind Render/Railway/etc so req.ip is the client
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Express 5 leaves req.body undefined when there is no JSON body (Express 4
// gave {}), which made `req.body.foo` throw in several handlers.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", service: "BandJam API", db: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", service: "BandJam API", db: "down" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
// Payments disabled: the old endpoint "simulated" a successful payment and
// flipped the booking to confirmed, so any consumer could skip owner approval
// by calling it directly. Re-enable once a real gateway (Razorpay) is wired up
// with server-side signature verification.
// app.use("/api/payments", paymentRoutes);

// unknown routes → JSON 404 instead of Express's HTML page
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// last-resort error handler (bad JSON body, anything thrown outside a try)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled route error:", err);
  res.status(err.status || 500).json({ success: false, message: "Internal server error" });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

let server;
migrate()
  .then(() => {
    server = app.listen(PORT, () => console.log("Server started at port:", PORT));
  })
  .catch((err) => {
    console.error("Migration failed, not starting server:", err);
    process.exit(1);
  });

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  (server ? new Promise((r) => server.close(r)) : Promise.resolve())
    .then(() => pool.end())
    .finally(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
