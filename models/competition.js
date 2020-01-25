const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const competitionSchema = new Schema({
    competitionName:    { type: String, required: true, trim: true },
    competitionLogo:    { type: String, default: null, trim: true },
    started:            { type: Boolean, default: false },
    finished:           { type: Boolean, default: false },
    players:            [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    champion:           { type: Schema.Types.ObjectId, ref: 'Player', default: null },
    deleted:            { type: Boolean, default: false },
    createdAt:          { type: Date, default: Date.now() },
    games:              [{ type: Schema.Types.ObjectId, ref: 'Game' }],
    slug:               { type: String, default: '' }
});

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition