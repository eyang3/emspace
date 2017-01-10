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
        //req.session.accessToken = accessToken;
    	done(null, profile);


    }
    ))

router.get('/logout', function(req, res){
  req.logout();
  req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
})
router.get('/reviewer', passport.authenticate('linkedin', {state: 'reviewer'}), function(req, res){});


router.get('/linkedin',
    passport.authenticate('linkedin', {state: 'recruiter'}),
    function (req, res) {
        // The request will be redirected to Linkedin for authentication, so this
        // function will not be called.
    });

router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function (req, res) {
	console.log(req.query.state);
        res.redirect('/?'+req.query.state);
    });

router.get('/stuff', function (req, res) {
    res.send('boo');
});
module.exports = router;
