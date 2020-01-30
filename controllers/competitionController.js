const slugGenerator = require('limax')
const Competition = require('../models/competition')
const Player = require('../models/player')
const Game = require('../models/game')
const Joi = require('joi')

const GameController = require('./gameController');

/**
 * Get all user competitions
 * 
 * @param {*} req 
 * @param {*} res
 */
function get(req, res) {
    // Find all user competitions
    Competition.find({ deleted: false })
    .populate('players')
    .populate('champion')
    .exec((err, competitions) => {
        res.json({
            'ok': true,
            'competitions': competitions
        });
    });
}

/**
 * Get a specific competition by ID
 * 
 * @param {*} req 
 * @param {*} res 
 */
function getById(req, res) {
    Competition.find({ '_id': req.params.id }, (err, competition) => {
        res.json({
            'ok': true,
            'competition': competition
        });
    });
}

/**
 * Get a specific competition by SLUG
 * 
 * @param {*} req
 * @param {*} res
 */
function getBySlug(req, res) {
    Competition.findOne({ 'slug': req.params.slug })
        .populate('players')
        .populate('champion')
        .populate({
            path: 'games',
            model: 'Game',
            populate: { path: 'whites' },
        })
        .exec((err, competition) => {
            res.json({
                'ok': true,
                'competition': competition
            });
        })
}

/**
 * Create a new competition
 * 
 * @param {*} req 
 * @param {*} res 
 */
function create(req, res) {    
    // Validation
    const schema = Joi.object().keys({
        competitionName: Joi.string().required(),
        competitionLogo: Joi.optional(),
        players: Joi.optional(),
        started: Joi.boolean().optional(),
        deleted: Joi.boolean().optional(),
        createdAt: Joi.optional(),
        slug: Joi.string()
    });

    Joi.validate(req.body, schema, (err, result) => {
        if(err) {
            res.json({
                'ok': false,
                'error': err.details
            });
        }
    });

    // Creating a competition
    let competition = new Competition({
        competitionName: req.body.competitionName,
        competitionLogo: req.file !== undefined ? req.file.path : null,
        players: req.body.players,
        slug: slugGenerator(req.body.competitionName)
    });
    
    // Save competition in the DB
    competition.save((err) => {
        if(err) return console.log(err);

        res.json({
            'ok': true,
            'competition': competition,
            'message': 'Competition has successfully been created.',
        });
    });
}

/**
 * Remove the competition
 * 
 * @param {*} req 
 * @param {*} res 
 */
function remove(req, res) {
    Competition.findOne({ _id: req.params.id })
        .then(competition => {
            competition.deleted = true;
            competition.save((err) => {
                if(err) return console.log(err);

                res.json({
                    ok: true,
                    message: 'Competition has been successfully removed.'
                });
            })
        });
}

/**
 * Add participants to the competition
 * 
 * @param {*} req 
 * @param {*} res 
 */
function addPlayers(req, res) {
    Competition.findOne({ _id: req.params.id })
        .then((competition) => {
            Player.find({ _id: { $in: req.body.players } })
                .then((players) => {
                    let newPlayers = [];
                    // Check for players already participate or not
                    for(let i = 0; i < players.length; i++) {
                        let newPlayer = players[i];
                        let newOne = true;
                        // Check if a player already participates in the competition
                        for(let j = 0; j < competition.players.length; j++) {
                            let oldPlayer = competition.players[j];

                            if(newPlayer._id.toString() === oldPlayer.toString()) {
                                newOne = false;
                            }
                        }
                        // If the player is a new one then add him to the competition players' array
                        if(newOne === true) {
                            competition.players.push(newPlayer);
                            newPlayers.push(newPlayer);
                        }
                    }

                    competition.save((err) => {
                        if(err) return console.log(err);
        
                        res.json({
                            ok: true,
                            message: 'Players are successfully added to the competition.',
                            _id: req.params.id,
                            competition,
                            players: newPlayers
                        });
                    });        
                });
        });    
}

/**
 * Remove participants from the competition
 * 
 * @param {*} req 
 * @param {*} res 
 */
function removePlayers(req, res) {
    Competition.findOne({ _id: req.params.id })
        .then((competition) => {
            competition.players = competition.players.filter(player => {
                return player.toString() !== req.params.playerId.toString()
            });

            competition.save((err) => {
                if(err) return console.log(err);

                res.json({
                    ok: true,
                    message: 'Player has been successfully removed.',
                    params: req.params,
                    competition
                });
            });
        });
}

function start(req, res) {
    if(!req.body.id) {
        return res.json({
            ok: false,
            message: 'Missing parameteres.'
        });
    }

    Competition.findOne({ _id: req.body.id })
        .then(competition => {
            let numberOfPlayers = [ 2, 4, 8, 16, 32 ];
            let maxNumberOfPlayers = 32;

            if(numberOfPlayers.includes(competition.players.length) && competition.players.length <= maxNumberOfPlayers) {
                // Shuffle competition players
                shuffledPlayers = shufflePlayers(competition.players);            
                
                // Games array to be added to a competition
                let games = [];
                whites = shuffledPlayers.whites;
                blacks = shuffledPlayers.blacks;
                let gamesType = null;

                if(whites.length === 1) {
                    gamesType = 'final';
                } else if(whites.length === 2) {
                    gamesType = 'semiFinal';
                } if(whites.length === 4) {
                    gamesType = 'quarterFinal';
                } if(whites.length > 4) {
                    gamesType = 'qualifications';
                }

                // Generate games for the competition
                for(let i = 0; i < whites.length; i++) {
                    // Defining white and black players
                    let whitePlayer = whites[i];
                    let blackPlayer = blacks[i];

                    // Creating games and getting ready for mass insert to the DB
                    games.push(new Game({
                        gameType: gamesType,
                        whites: whitePlayer,
                        whitesTime: null,
                        blacks: blackPlayer,
                        blacksTime: null,
                        winner: null,
                        pgn: '',
                        fen: '',
                        competition: competition,
                    }));
                }

                Game.insertMany(games, function(err) {
                    if(err) return console.log(err);
                });

                competition.started = true;

                competition.save(err => {
                    if(err) return console.log(err);

                    return res.json({
                        ok: true,
                        message: 'Competition has been successfully started.',
                        shuffledPlayers,
                        competition,
                        games,
                        players: competition.players
                    });
                });
            } else {
                return res.json({
                    ok: false,
                    message: 'The number of players shoud be 2, 4, 8, 16 or 32.'
                });
            }

            
        });
}

function shufflePlayers(players) {
    let whites = [];
    let blacks = [];
    let playersCount = players.length;

    if(playersCount % 2 === 0) {

        var currentIndex = players.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = players[currentIndex];
            players[currentIndex] = players[randomIndex];
            players[randomIndex] = temporaryValue;
        }

        for(let i = 0; i < playersCount; i ++) {
            if(i % 2 === 1) {
                whites.push(players[i]);
            } else {
                blacks.push(players[i]);
            }
        }

    }

    return {
        whites,
        blacks
    };
}

function getCompetitionGames(req, res) {
    if(!req.params.id) {
        return res.json({
            ok: false,
            message: 'Missing parametr'
        });
    }

    Game.find({ competition: req.params.id })
        .populate('whites')
        .populate('blacks')
        .then(games => {
            let qualifications = { text: 'Qualifications', items: [] };
            let quarterFinal = { text: 'Quarter final', items: [] };
            let semiFinal = { text: 'Semi final', items: [] };
            let final = { text: 'Final', items: [] };

            let competitionGames = [];

            games.map(game => {
                if(game.gameType === 'qualifications') qualifications.items.push(game);
                if(game.gameType === 'quarterFinal') quarterFinal.items.push(game);
                if(game.gameType === 'semiFinal') semiFinal.items.push(game);
                if(game.gameType === 'final') final.items.push(game);
            });


            res.json({
                ok: true,
                games: {
                    qualifications,
                    quarterFinal,
                    semiFinal,
                    final
                }
            });
        });
}

function createNextStageGames(req, res) {
    Competition.findById(req.params.id)
        .then(competition => {
            let gameTypeToSearch = null;
            
            if(req.body.gameType === 'quarterFinal') {
                gameTypeToSearch = 'qualifications'
            } else if(req.body.gameType === 'semiFinal') {
                gameTypeToSearch = 'quarterFinal'
            } else if(req.body.gameType === 'final') { 
                gameTypeToSearch = 'semiFinal'
            }

            Game.find({ 
                competition: competition._id, 
                ended: true,
                gameType: gameTypeToSearch
            })
            .then(games => {

                // Determine all the winners of qualification games
                let gamesType = req.body.gameType;
                let gamesWinners = games.map(game => {
                    return game[game.winner];
                });

                let shuffledPlayers = shufflePlayers(gamesWinners);

                // Games array to be added to a competition
                let newGames = [];
                whites = shuffledPlayers.whites;
                blacks = shuffledPlayers.blacks;

                // Generate games for the competition
                for(let i = 0; i < whites.length; i++) {
                    // Defining white and black players
                    let whitePlayer = whites[i];
                    let blackPlayer = blacks[i];

                    // Creating games and getting ready for mass insert to the DB
                    newGames.push(new Game({
                        gameType: gamesType,
                        whites: whitePlayer,
                        whitesTime: null,
                        blacks: blackPlayer,
                        blacksTime: null,
                        winner: null,
                        pgn: '',
                        fen: '',
                        competition: competition,
                    }));
                }

                Game.insertMany(newGames, function(err) {
                    if(err) return console.log(err);
                });

                return res.json({
                    ok: true,
                    message: 'Next stage has been set.',
                    newGames
                });
            });
        });
}

function finish(req, res) {
    if(!req.body.id) {
        return res.json({
            ok: false,
            message: 'Missing parameteres.'
        });
    }

    Competition.findById(req.body.id)
        .then(competition => {
            

            Game.findOne({ competition: req.body.id, gameType: 'final' })
                .populate('whites')
                .populate('blacks')
                .exec((err, game) => {
                    let competitionChampion = game[game.winner];

                    competition.finished = true;
                    competition.champion = competitionChampion._id;
                    competition.save(err => {
                        if(err) return console.log('error')

                        return res.json({
                            ok: true,
                            message: 'The competition has been successfully finished.',
                            competitionChampion,
                        });
                    });
                });
        });
} 

// Export
module.exports = {
    get,
    getById,
    getBySlug,
    create,
    remove,
    addPlayers,
    removePlayers,
    start,
    getCompetitionGames,
    createNextStageGames,
    finish
}