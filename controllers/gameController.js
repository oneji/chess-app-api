const Game = require('../models/game');
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
            res.json({
                'ok': true,
                'games': games
            });
    })
}

function getGameById(req, res) {
    if(req.params.id === undefined) {
        return res.json({
            ok: false,
            message: 'Missing params.'
        });
    }

    Game.findOne({ _id: req.params.id })
        .populate('whites')
        .populate('blacks')
        .then(game => {
            return res.json({
                ok: true,
                game
            });
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
            history: [],
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
        history: [],
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

function saveHistory(req, res) {
    Game.findById(req.params.id)
        .then(game => {
            game.history = req.body.history;
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
    setTheWinner,
    saveHistory
}