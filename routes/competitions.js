const express = require('express')
const router = express.Router()
const multer = require('multer')
const authMiddleware = require('../middleware/auth')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/competitions')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Contollers
const CompetitionController = require('../controllers/competitionController')

// Routes
router.get('/', authMiddleware, authMiddleware, CompetitionController.get);
router.get('/getById/:id', authMiddleware, CompetitionController.getById);
router.get('/getBySlug/:slug', authMiddleware, CompetitionController.getBySlug);
router.post('/', upload.single('competitionLogo'), authMiddleware, CompetitionController.create);
router.delete('/remove/:id', authMiddleware, CompetitionController.remove);
router.post('/:id/addPlayers', authMiddleware, CompetitionController.addPlayers);
router.delete('/:id/removePlayers/:playerId', authMiddleware, CompetitionController.removePlayers);
router.post('/start', authMiddleware, CompetitionController.start);
router.get('/:id/games', authMiddleware, CompetitionController.getCompetitionGames);
router.post('/:id/nextStage', authMiddleware, CompetitionController.createNextStageGames);
router.post('/finish', authMiddleware, CompetitionController.finish);
// Export
module.exports = router
