// Determine the environment
const env = process.env.NODE_ENV;
const config = require('../configs/environments')[env]
const jwt = require('jsonwebtoken');

console.log(config.secrets.jwt);

function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    // Check for token
    if(!authHeader) {
        res.status(401).json({
            ok: false,
            message: 'Token is not provided.'
        });
    }

    // GEt rid of Bearer prefix in the token
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, config.secrets.jwt);
        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({
            ok: false,
            message: 'Token is not valid.'
        });
    }
}

module.exports = auth;