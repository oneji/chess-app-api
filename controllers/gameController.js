const Game = require('../models/game');
const Player = require('../models/player');
const PlayerController = require('../controllers/playerController');
const Joi = require('joi');

/**
 * Get all competition's games
 * 
 * @param {*} req 
 * @param {*} res
 */
function get(req, res) {
    if(req.params.competitionId === undefined) {
        return res.json({
            ok: false,
            message: 'Missing parametr'
        });
    }

    // Find all competition's games
    Game.find({ competition: req.params.competitionId })
        .populate('whites')
        .populate('blacks')
        .exec((err, games) => {
            let qualifications = { text: 'Qualifications', items: [] };
            let quarterFinal = { text: 'Quarter final', items: [] };
            let semiFinal = { text: 'Semi final', items: [] };
            let final = { text: 'Final', items: [] };

            games.map(game => {
                if(game.gameType === 'qualifications') qualifications.items.push(game);
                if(game.gameType === 'quarterFinal') quarterFinal.items.push(game);
                if(game.gameType === 'semiFinal') semiFinal.items.push(game);
                if(game.gameType === 'final') final.items.push(game);
            });


            res.json({
                ok: true,
                games: {
                    final,
                    semiFinal,
                    quarterFinal,
                    qualifications
                }
            });
    })
}

async function getGameById(req, res) {
    if(req.params.id === undefined) {
        return res.json({
            ok: false,
            message: 'Missing params.'
        });
    }

    let game = await Game.findOne({ _id: req.params.id }).populate('whites').populate('blacks');

    let whitePlayer = game.whites;
    let blackPlayer = game.blacks;
    // Get the data about Players

    let whitePlayerGames = await Game.find({
        $or: [
            { whites: whitePlayer._id },
            { blacks: whitePlayer._id }
        ]
    });

    let blackPlayerGames = await Game.find({
        $or: [
            { whites: blackPlayer._id },
            { blacks: blackPlayer._id }
        ]
    });

    whitePlayerStats = PlayerController.playerStats(whitePlayer._id, whitePlayerGames);
    blackPlayerStats = PlayerController.playerStats(blackPlayer._id, blackPlayerGames);

    return res.json({
        ok: true,
        game,
        stats: {
            whitePlayerStats,
            blackPlayerStats
        }
    });
}

function generateGames(shuffledPlayers, competition) {
    // Games array to be added to a competition
    let games = [];
    whites = shuffledPlayers.whites;
    blacks = shuffledPlayers.blacks;

    for(let i = 0; i < whites.length; i++) {
        // Defining white and black players
        let whitePlayer = whites[i];
        let blackPlayer = blacks[i];

        // Creating a game
        let game = new Game({
            whites: whitePlayer,
            whitesTime: null,
            blacks: blackPlayer,
            blacksTime: null,
            winner: null,
            pgn: [],
            fen: '',
            competition: competition,
        });

        Game.insertMany(games, (err) => {
            if(err) return console.log(err);
        });
    }

    return games;
}

/**
 * Create a new game
 * 
 * @param {*} req 
 * @param {*} res 
 */
function create(req, res) {
    // Creating a game
    let game = new Game({
        gameType: req.body.gameType,
        whites: req.body.whites,
        whitesTime: req.body.whitesTime,
        blacks: req.body.blacks,
        blacksTime: req.body.blacksTime,
        winner: req.body.winner,
        pgn: [],
        fen: '',
        competition: req.body.competition,
    });
    
    // Save game in the DB
    game.save((err) => {
        if(err) return console.log(err);

        res.json({
            'ok': true,
            'game': game,
            'message': 'Game has successfully been created.'
        });
    });
}

function start(req, res) {
    if(!req.params.id) {
        return res.json({
            ok: false,
            message: 'Missing parametr.'
        });
    }

    Game.findById(req.params.id)
        .then(game => {
            game.started = true;
            
            game.save(err => {
                if(err) return console.log(err);

                return res.json({
                    ok: true,
                    message: 'The game has been successfully started.',
                    game
                });
            });
        });
}

function setTheWinner(req, res) {
    if(req.body.playerId === undefined) {
        return res.json({
            ok: false,
            message: 'Missing parametr.',
            body: req.body
        });
    }

    let winnerID = req.body.playerId.toString();
    
    Game.findById(req.params.id)
        .then(game => {
            game.winner = winnerID === game.whites.toString() ? 'whites' : 'blacks';

            game.save(err => {
                if(err) return console.log(err);

                return res.json({
                    ok: true,
                    message: '',
                    game,
                    winnerID
                });
            });

            
        });
}

function finish(req, res) {
    Game.findById(req.params.id)
        .then(game => {
            game.ended = true;
            game.whitesTime = req.body.whitesTime;
            game.blacksTime = req.body.blacksTime;
            game.winner = req.body.winner;
            
            game.save(err => {
                if(err) return console.log(err);

                return res.json({
                    ok: true,
                    message: 'The game has been successfully finished.',
                    game
                });
            });
        });
}

function draw(req, res) {
    Game.findById(req.params.id)
        .then(game => {
            game.drawn = true;
            
            game.save(err => {
                if(err) return console.log(err);

                return res.json({
                    ok: true,
                    message: 'The game has been successfully drawn.',
                    game
                });
            });
        });
}

function saveHistory(req, res) {
    Game.findById(req.params.id)
        .then(game => {
            game.pgn = req.body.pgn;
            game.fen = req.body.fen;

            game.save(err => {
                if(err) return console.log(err);

                return res.json({
                    ok: true,
                    message: 'History has been successfully saved.'
                });
            });
        });
}

module.exports = {
    get,
    getGameById,
    create,
    generateGames,
    start,
    finish,
    draw,
    setTheWinner,
    saveHistory
}