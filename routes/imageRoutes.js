// routes/imageRoutes.js
const express = require("express");
const { uploadImage } = require("../controllers/imageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/upload-image", protect, uploadImage);
module.exports = router;