/**
 * Created by cconstantino on 25/01/2016.
 */
"use strict";

const debug = require("debug")("user-controller");
const model = require("../app-logic/user-model");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var express = require('express');
var router = express.Router();

/**
 * Expand router with login and logout.
 *
 */
function verifyCredentialsAndGetUser(username, password, done) {
    debug("username: %s - password: %s", username, password);

    model.getUser(username, function(err,user){
        if( password == user.pass ) {
            done(null, {name: username, secret: "SLB é o maior"} );
        }
        else {
            done(null, false, { message: 'Incorrect username or password.' })
        }
    });
}
/**
 * Indicates type of authentication strategy
 */
passport.use(new LocalStrategy(
    function(username, password, done) {
        verifyCredentialsAndGetUser(username, password, done);
    }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    //User.findById(id, function(err, user) {
    done(null, user);
    //});
});

/**
 * Callback to /register
 * This callback registers a user in database. In case of success, redirects to /login.
 * If it fails, redirects again to /register
 * @param req
 * @param res
 * @param next
 */
function registerUser(req,res,next){
    var param = req.body;
    debug("registerUser: ",param.username,param.password);
    model.createUser(param.username, param.password, function(err,user){
        if (err==undefined){
            res.redirect("/login");
            //passport.authenticate('local',
            //    { successRedirect: '/favourites',  failureRedirect: '/login', failureFlash: true })
        }else{
            debug("registerUser fail - ",err);
            res.redirect("/register");
        }

    });
}

/**
 * declare routing
 */
router.get("/login", login);
router.get("/register", register);
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

/**
 * Tries to authenticate a user.
 */
router.post("/login",
        passport.authenticate('local',
            { successRedirect: '/favourites',  failureRedirect: '/login', failureFlash: true }),
        function(req, res, next) {
            // If this function gets called, authentication was successful.
            // `req.user` contains the authenticated user.
            debug("user %j is logged in", req.user);
            next();
        }
);

/**
 * Register a user. Responses to a submit in a form
 */
router.post("/register",registerUser );


/**
 * Express callback function to request of login resource
 * @param req
 * @param res
 * @param next
 */
function login(req,res,next){
    debug("login");
    let error = req.flash("error");
    res.render('login', { error: error});
}

/**
 * Express Callback to a request of register resource that allows user to create himself
 * @param req
 * @param res
 * @param next
 */
function register(req,res,next){
    debug("register");
    res.render('register');
}

module.exports = router;


