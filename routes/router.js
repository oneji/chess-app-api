const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'))
router.use('/competitions', require('./competitions'))
router.use('/games', require('./games'))
router.use('/players', require('./players'))
router.use('/statistics', require('./statistics'))

module.exports = router;