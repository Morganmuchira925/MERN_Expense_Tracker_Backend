// controllers/imageController.js
const path = require("path");
const fs = require("fs");

exports.uploadImage = async (req, res) => {
  try {
    console.log('📨 Image upload request received');
    
    if (!req.files || !req.files.image) {
      console.log('❌ No image file provided');
      return res.status(400).json({ 
        success: false,
        message: "No image file provided" 
      });
    }

    const image = req.files.image;
    
    console.log('📸 Image details:', {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype
    });

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimes.includes(image.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and GIF are allowed."
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (image.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Creating uploads directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(image.name);
    const fileName = `profile_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    console.log('💾 Saving image to:', filePath);

    // Move the file
    await image.mv(filePath);

    // Return the file URL - make sure it's a full URL if needed
    const imageUrl = `/uploads/${fileName}`;
    
    console.log('✅ Image uploaded successfully:', imageUrl);

    res.status(200).json({
      success: true,
      imageURL: imageUrl, // ✅ Consistent naming with frontend expectation
      message: "Image uploaded successfully"
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during image upload",
      error: error.message 
    });
  }
};