const express = require('express')
const router = express.Router()
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Contollers
const CompetitionController = require('../controllers/competitionController')

// Routes
router.get('/', CompetitionController.get);
router.get('/getById/:id', CompetitionController.getById);
router.get('/getBySlug/:slug', CompetitionController.getBySlug);
router.post('/', upload.single('competitionLogo'), CompetitionController.create);
router.delete('/remove/:id', CompetitionController.remove);
router.post('/:id/addPlayers', CompetitionController.addPlayers);
router.delete('/:id/removePlayers/:playerId', CompetitionController.removePlayers);
router.post('/start', CompetitionController.start);
router.get('/:id/games', CompetitionController.getCompetitionGames);

// Export
module.exports = router
