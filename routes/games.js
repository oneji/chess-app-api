const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Contollers
const GameController = require('../controllers/gameController')

// Routes
router.get('/:competitionId', authMiddleware, GameController.get);
router.get('/getById/:id', authMiddleware, GameController.getGameById);
router.post('/', authMiddleware, GameController.create);
router.post('/start/:id', authMiddleware, GameController.start);
router.put('/finish/:id', authMiddleware, GameController.finish);
router.post('/:id/setTheWinner', authMiddleware, GameController.setTheWinner);
router.post('/saveHistory/:id', authMiddleware, GameController.saveHistory);
// Export
module.exports = router