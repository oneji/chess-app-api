const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user')

passport.use(
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, (username, password, cb) => {
        User.findOne({ username: username }, function(err, user) {
            // If user exists
            if(!user) { 
                return cb(null, false, { message: 'Пользователя с таким именем не найдено.' });
            }

            // Compare passwords
            bcrypt.compare(password, user.password, function(err, success) {
                // If passwords are the same
                if(!success) { 
                    return cb(null, false, { message: 'Неверный пароль.' });
                }

                return cb(null, user, { message: 'Успешный вход.' });                
            });
            
        });
    })
);