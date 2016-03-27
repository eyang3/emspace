var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../repositories/user');
var Database = require('../repositories/database');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

var user = new User(new Database());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_KEY,
    clientSecret: process.env.LINKEDIN_SECRET,
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_basicprofile', 'r_emailaddress', 'w_share'],
    passReqToCallback: true
},
    function (req, accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        req.session.accessToken = accessToken;
        process.nextTick(function () {
            // console.log(profile);
            user.get(profile._json.id)
                .then(function (result) {
                    if (result.length === 0) {
                        return user.insert(profile._json);
                    } else {
                        if(user.hasNewSpecializations(profile._json, result[0].specializations)) {
                            return user.updateSpecialization(profile._json);
                        }
                    }
                })
                .then(function () {
                    return done(null, profile);
                });


        });
    }
    ))

router.get('/linkedin',
    passport.authenticate('linkedin', { state: 'SOME STATE' }),
    function (req, res) {
        // The request will be redirected to Linkedin for authentication, so this
        // function will not be called.
    });

router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

router.get('/stuff', function (req, res) {
    res.send('boo');
});
module.exports = router;
