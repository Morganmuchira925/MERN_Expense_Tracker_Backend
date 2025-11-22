const User = require('../models/User');
const jwt = require('jsonwebtoken');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Generate avatar from name
const generateAvatarFromName = (fullName) => {
    if (!fullName) return null;
    
    const names = fullName.trim().split(' ');
    let initials = '';
    
    if (names.length === 1) {
        initials = names[0].substring(0, 2).toUpperCase();
    } else {
        initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=128&bold=true&font-size=0.5`;
};

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Please provide full name, email, and password" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already in use" 
            });
        }

        // Handle profile image upload to Cloudinary
        let profileImageUrl = null;

        if (req.file) {
            try {
                console.log('📤 Uploading profile image to Cloudinary...');
                const result = await uploadToCloudinary(req.file.buffer, 'expense_tracker/profiles');
                profileImageUrl = result.secure_url;
                console.log('✅ Image uploaded:', profileImageUrl);
            } catch (uploadError) {
                console.error('❌ Cloudinary upload error:', uploadError);
                // Continue without profile image - don't fail registration
            }
        }

        // Use uploaded image or generate avatar
        const userProfileImage = profileImageUrl || generateAvatarFromName(fullName);

        // Create new user
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            profileImage: userProfileImage,
        });

        // Generate token
        const token = generateToken(user._id);

        // Response
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error during registration",
            error: err.message 
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: "Please provide both email and password" 
        });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: "Login failed. Please try again.",
            error: err.message 
        });
    }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: err.message
        });
    }
};