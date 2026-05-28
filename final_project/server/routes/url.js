const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { shortenValidation } = require("../middleware/validators");
const {
  shortenUrl,
  getMyUrls,
  getAnalytics,
  deleteUrl,
  updateUrl,
} = require("../controllers/urlController");

// All routes below require authentication
router.use(protect);

// POST   /api/url/shorten         → Create short URL
router.post("/shorten", shortenValidation, shortenUrl);

// GET    /api/url/my-urls         → List all URLs for logged-in user
router.get("/my-urls", getMyUrls);

// GET    /api/url/analytics/:id   → Analytics for a specific URL
router.get("/analytics/:id", getAnalytics);

// PUT    /api/url/:id             → Update destination URL / expiry
router.put("/:id", updateUrl);

// DELETE /api/url/:id             → Delete a URL
router.delete("/:id", deleteUrl);

module.exports = router;
