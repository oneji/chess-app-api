var mongoose = require('mongoose');

module.exports = function (config) {
    mongoose.connect(config.db, { useUnifiedTopology: true, useNewUrlParser: true });
    mongoose.Promise = global.Promise;
    mongoose.connection.once('open', function() {
        console.log('Connection to db has been established...');
    }).on('error', function(error) {
        console.error('Connection to db failed..', error);
    });
};