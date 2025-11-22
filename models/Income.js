const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    icon: { type: String },
    source: { type: String, required: true },//Example: Salary, Freelance, etc.
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
// This code defines a Mongoose schema and model for an "Income" entity in a Node.js application. The schema includes fields for user ID, income source, amount, date, and an optional icon. The model is then exported for use in other parts of the application.