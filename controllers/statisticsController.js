const Competition = require('../models/competition')
const Player = require('../models/player')

function get(req, res) {
    // An array for collecting all the information
    let statistics = [];    
    // A number of competitions
    Competition.countDocuments({}, (err, count) => {
        statistics.push({
            'text': 'A number of competitions',
            'number': count
        });

        res.json({
            'ok': true,
            statistics
        });
    });
    // A number of players in total
    Player.countDocuments({}, (err, count) => {
        statistics.push({
            'text': 'A number of players',
            'number': count
        });
    });

    
}

module.exports = {
    get
}