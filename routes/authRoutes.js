const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    registerUser,
    loginUser,
    getUserInfo,
} = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const router = express.Router();

// Register with optional profile image upload
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// General image upload endpoint (protected - requires auth)
router.post("/upload-image", protect, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: "No file uploaded" 
            });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'expense_tracker/uploads');
        
        res.status(200).json({ 
            success: true,
            imageURL: result.secure_url 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false,
            message: "Image upload failed",
            error: error.message 
        });
    }
});

module.exports = router;