const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }, // Use hashing for security
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
