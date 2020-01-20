const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Contollers
const StatisticsController = require('../controllers/statisticsController')

// Routes
router.get('/', authMiddleware, StatisticsController.get);

// Export
module.exports = router