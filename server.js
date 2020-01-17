const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const path = require('path')

// Determine the environment
const env = process.env.NODE_ENV;
const config = require('./configs/environments')[env]

console.log(env);

require('./configs/passport')

// Initialize an app
const app = express();
app.use('/uploads', express.static('uploads'));

// Connect to the db
require('./configs/mongoose')(config);

// CORS
app.use(cors());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Api routes
app.use('/', require('./routes/router'));

const __PORT__ = process.env.PORT || 5000;

app.listen(__PORT__, () => { 
    console.log('Server\'s been started on port: ' + __PORT__); 
});