const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    playerName: { type: String, required: true, trim: true },
    playerPhone: { type: String, default: null, trim: true },
    playerEmail: { type: String, default: null, trim: true },
    playerCountry: { type: String, default: null, trim: true },
    playerPhoto: { type: String, default: null, trim: true },
    deleted: { type: Boolean, default: false }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;