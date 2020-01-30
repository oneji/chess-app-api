const Player = require('../models/player');
const Joi = require('joi')

/**
 * Get all players
 * 
 * @param {*} req 
 * @param {*} res
 */
function get(req, res) {
    // Find all players from db
    Player.find({ deleted: false }, (err, players) => {
        res.json({
            'ok': true,
            'players': players
        });
    });
}

/**
 * Create a new player
 * 
 * @param {*} req
 * @param {*} res
 */
function create(req, res) {
    // Validation
    const schema = Joi.object().keys({
        playerName: Joi.string().required(),
        playerCountry: Joi.optional(),
        playerPhone: Joi.optional(),
        playerEmail: Joi.optional(),
        playerPhoto: Joi.optional()
    });

    Joi.validate(req.body, schema, (err, result) => {
        if(err) {
            res.json({
                'ok': false,
                'error': err.details
            });
        }
    });

    // Creating a player
    let player = new Player({
        playerName: req.body.playerName,
        playerCountry: req.body.playerCountry,
        playerPhone: req.body.playerPhone,
        playerEmail: req.body.playerEmail,
        playerPhoto: req.file !== undefined ? req.file.path : null,
    });
    
    // Save player in the DB
    player.save((err) => {
        if(err) return console.log(err);

        res.json({
            'ok': true,
            'player': player,
            'message': 'Player has successfully been created.'
        });
    });
}

function remove(req, res) {
    Player.findById(req.params.id)
        .then(player => {
            player.deleted = true;
            player.save(err => {
                if(err) console.log('error');

                return res.json({
                    ok: true,
                    message: 'Player has been successfully deleted.',
                    player
                });
            });
        });
}

function playerStats(playerId, games) {
    let totalGamesPlayed = Number(games.length);
    let gamesWon = 0;

    for(let i = 0; i < games.length; i++) {
        let g = games[i];
        
        if(g[g.winner].toString() === playerId.toString()) {
            gamesWon++;
        }
    }

    let gamesLost = totalGamesPlayed - gamesWon;

    return [
        { text: 'Total games played', value: totalGamesPlayed },
        { text: 'Games won', value: gamesWon },
        { text: 'Games lost', value: gamesLost },
    ];
}

module.exports = {
    get,
    create,
    remove,
    playerStats
}