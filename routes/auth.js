const express = require('express')
const router = express.Router()

// Models
const User = require('../models/user')
// Contollers
const AuthController = require('../controllers/authController')

// Routes
router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/me', AuthController.fetchUser);

// Export
module.exports = router
