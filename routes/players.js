const express = require('express')
const router = express.Router()
const multer = require('multer')
const authMiddleware = require('../middleware/auth')

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
const PlayerController = require('../controllers/playerController')

// Routes
router.get('/', authMiddleware, PlayerController.get);
router.post('/', upload.single('playerPhoto'), authMiddleware, PlayerController.create);
// Export
module.exports = router