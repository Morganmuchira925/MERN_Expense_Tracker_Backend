// const mongoose = require('mongoose');

// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profileImage: {type: String, default: null },
// },
// {
//     timestamps: true,
// });

// //Hash password before saving
// UserSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// //Compare passwords
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model("User", UserSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, // Ensures email case consistency
        trim: true // Removes whitespace
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6 // Enforce minimum password length
    },
    profileImage: { type: String, default: null },
}, { timestamps: true });

// Enhanced password hashing with error handling
UserSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();
        
        // Verify salt rounds are working
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// More robust password comparison
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!candidatePassword || !this.password) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        console.error('Password comparison error:', err);
        return false;
    }
};

// Add hook for findOneAndUpdate
UserSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(update.password, salt);
            this.setUpdate(update);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model("User", UserSchema);