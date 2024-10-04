const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    touristLocation: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    initial:{ type: String, required: true } // Reference to User
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
