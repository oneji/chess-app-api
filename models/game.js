const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    started:        { type: Boolean, default: false },
    ended:          { type: Boolean, default: false },
    drawn:          { type: Boolean, default: false },
    gameType:       { type: String, default: '' },
    whites:         { type: Schema.Types.ObjectId, ref: 'Player' },
    whitesTime:     { type: String, default: null },
    blacks:         { type: Schema.Types.ObjectId, ref: 'Player' },
    blacksTime:     { type: String, default: null },
    winner:         { type: String, default: null },
    pgn:            { type: String, default: '' },
    fen:            { type: String, default: '' },
    createdAt:      { type: Date, default: Date.now() },
    competition:    { type: Schema.Types.ObjectId, ref: 'Competition' }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;