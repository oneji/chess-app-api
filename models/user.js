const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const config = require('../configs/environments')[env]
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    username: String,
    password: String,
});

// User model's static methods
userSchema.statics.getCurrentUser = function(token) {
    return jwt.verify(token, config.secrets.jwt);
}

const User = mongoose.model('User', userSchema);

module.exports = User