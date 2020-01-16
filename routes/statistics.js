const express = require('express')
const router = express.Router()

// Contollers
const StatisticsController = require('../controllers/statisticsController')

// Routes
router.get('/', StatisticsController.get);

// Export
module.exports = router