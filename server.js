const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Initialize an app
const app = express();
const http = require('http').Server(app);

// Determine the environment
const env = process.env.NODE_ENV;
const config = require('./configs/environments')[env];

require('./configs/passport');

// Connect to the db
require('./configs/mongoose')(config);

app.use('/uploads', express.static('uploads'));
// CORS
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Api routes
app.use('/', require('./routes/router'));

const __PORT__ = process.env.PORT || 5000;

http.listen(__PORT__, () => { 
    console.log('Server\'s been started on port: ' + __PORT__); 
});