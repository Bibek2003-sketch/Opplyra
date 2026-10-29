require("dotenv").config();
require("./utils/sanitizeLog");
const express = require("express");
const cors = require("cors");
const { connectDB, getDbStatus } = require("./config/db");
const Opportunity = require("./models/Opportunity");
const { sampleOpportunities } = require("./seeds/seedData");

// Import Route Handlers
const authRoutes = require("./routes/authRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const savedRoutes = require("./routes/savedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startScheduler } = require("./services/scheduler");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
    ],
    credentials: true,
  }),
);

// Request body size limit (allows up to 5MB for profile avatar image uploads)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Static uploads directory for user-uploaded profile avatars
const path = require("path");
const uploadsDir = path.join(__dirname, "../public/uploads/avatars");
const fs = require("fs");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`,
      );
    }
  });
  next();
});

// Health & System Status Endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: "online",
    appName: "Opplyra API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: {
      mode: dbStatus.mode,
      isConnected: dbStatus.isConnected,
      description:
        dbStatus.mode === "mongodb"
          ? "Durable persistent storage connected via MongoDB / Mongoose."
          : "In-Memory Dev Fallback active. Data is non-durable and will reset on process restart.",
    },
  });
});

// Mount Resource Routes
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.method} ${req.originalUrl}" not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Unhandled Server Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start Server and Initialize Database
async function startServer() {
  const dbState = await connectDB();

  // If MongoDB is connected and empty, auto-seed with demonstration records
  if (dbState.mode === "mongodb") {
    try {
      const count = await Opportunity.countDocuments();
      if (count === 0) {
        console.log(
          "[Init] Database is empty. Auto-seeding demonstration catalogue...",
        );
        await Opportunity.insertMany(sampleOpportunities);
        console.log(
          `[Init] Seeded ${sampleOpportunities.length} opportunities.`,
        );
      } else {
        // Upgrade any legacy demo URLs in existing opportunities to verified official URLs
        for (const sample of sampleOpportunities) {
          await Opportunity.updateMany(
            { title: sample.title, sourceUrl: { $regex: /demo/i } },
            {
              $set: {
                sourceUrl: sample.sourceUrl,
                officialHomepageUrl: sample.officialHomepageUrl,
                sourceDomain: sample.sourceDomain,
                urlVerificationStatus: sample.urlVerificationStatus,
                verifiedAt: new Date(),
                isDemonstration: false,
              },
            },
          );
        }
      }

      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log(
          "[Init] Auto-seeding initial student account in database...",
        );
        await User.create({
          email: "priya.sharma@college.edu",
          password:
            "954ae4c7b20b9cdf43b543256c7e64b2:e598fc8f054a6b0285de787c6e9a4f9baba1834dec8132ff955ff4b57bf537e3c0098d8a80cbf84c10b2d9cb62042246e6573f6b7edd038cb4d4d23c147475f6",
          fullName: "Priya Sharma",
          course: "B.Tech Computer Science",
          academicYear: "3rd Year",
        });
        console.log("[Init] Seeded default student user in database.");
      }
    } catch (seedErr) {
      console.warn("[Init] Auto-seed warning:", seedErr.message);
    }
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(` Opplyra API Server running on port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(` Storage: ${dbState.mode.toUpperCase()}`);
    console.log(` URL: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  // Start periodic deadline checking & reminders
  startScheduler();

  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = { app, startServer };
