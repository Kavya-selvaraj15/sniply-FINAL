const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const urlRoutes = require("./routes/url");
const redirectRoutes = require("./routes/redirect");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many requests." },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many auth attempts." },
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
    timestamp: new Date(),
  });
});

// API routes FIRST - before redirect
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/url", urlRoutes);

// Short URL redirect LAST
app.use("/", redirectRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  Database: PostgreSQL\n`);
});

module.exports = app;
