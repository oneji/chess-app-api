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
const PlayerController = require('../controllers/playerController')

// Routes
router.get('/', PlayerController.get);
router.post('/', upload.single('playerPhoto'), PlayerController.create);
// Export
module.exports = router