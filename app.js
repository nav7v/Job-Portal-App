import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import visitTracker from "./middleware/visitTracker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  res.set("Cache-Control", "no-store");
  next();
});

// Body parsers & static file serving
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Visit tracker middleware
app.use(visitTracker);

// Global defaults for all views
app.use((req, res, next) => {
  res.locals.search = null;
  next();
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", mainRoutes);
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("main/404", {
    user: req.session.userId
      ? { id: req.session.userId, name: req.session.userName }
      : null,
    activePage: "",
    lastVisit: req.session.lastVisit || new Date().toLocaleString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("main/404", {
    error: err.message,
    user: req.session.userId
      ? { id: req.session.userId, name: req.session.userName }
      : null,
    activePage: "",
    lastVisit: req.session.lastVisit || new Date().toLocaleString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
