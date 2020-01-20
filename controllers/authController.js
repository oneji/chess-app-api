const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const env = process.env.NODE_ENV;
const config = require('../configs/environments')[env]

/**
 * User sign up
 *
 * @param req
 * @param res
 */
function signUp(req, res) {
    const credentials = req.body;    
    const saltRounds = 10;
    // Hash the password
    bcrypt.hash(credentials.password, saltRounds, function(err, hash) {
        const hashedPassword = hash;

        User.create({
            username: credentials.username,
            password: hashedPassword
        }, function(err, newUser) {
            res.json({
                'user': newUser
            });
        });
    });
}

/**
 * User sign in
 *
 * @param req
 * @param res
 */
function signIn(req, res) {
    const credentials = req.body;
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.json({
                'ok': false,
                'message': info.message
            });
        }
        
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            // generate a signed json web token with the contents of user object and return it in the response
            const token = jwt.sign({ user: user.toJSON() }, config.secrets.jwt, {
                expiresIn: '1h'
            });

            return res.json({
                ok: true,
                user,
                token
            });
        });
    })(req, res);
}

/**
 * Get current user via token
 *
 * @param req
 * @param res
 */
function fetchUser(req, res) {
    if(req.headers && req.headers.authorization) {
        var token = req.headers.authorization.split(' ')[1];
        try {
            let decodedUser = jwt.verify(token, config.secrets.jwt);

            User.findOne({ '_id': decodedUser._id }, function(err, user) {
                res.json({
                    'ok': true,
                    'user': user
                }); 

            })            
        } catch (e) {
            return res.status(401).send(e);
        }
    }
     
}

// Exports 
module.exports = {
    signUp,
    signIn,
    fetchUser
}