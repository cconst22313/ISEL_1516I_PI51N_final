"use strict";

const http = require("http");
const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const debug = require("debug")("football-server");
const hbs = require('hbs');
const session = require('express-session');
const flash = require('connect-flash');  //message creating util
const passport = require("passport");

debug("hbs %j", hbs);

// register the View Helpers
hbs.registerPartials(__dirname + '/views/partials');
require("./helpers/view/view-helpers")();

const leaguesController = require("./controllers/leagues-controller");
const userController = require("./controllers/user-controller");

//Express application
const app = express();
//Http server
const server = http.createServer(app);

//indicates that template engine is Handlebars
app.set('view engine', 'hbs');

//exposes public resources in the same path
app.use("/", express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'some secret' }));
app.use(session()); // session middleware
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// Configure routing
// Free access
app.use("/",userController);
/**
 * Note the difference between the above statement and the following...
 * On te above statement, express module uses a module that exposes
 * get and post functions that registers several routing...
 * The following uses explicit route declaration
 */
app.get("/", function(req,res,next){
    res.code = 302;
    res.redirect("/leagues");
});
app.get("/leagues", leaguesController.getLeagues);
app.get("/leagues/:id", leaguesController.getLeague);
app.get("/leagues/:id/fixtures",leaguesController.getLeagueFixture);
app.get("/teams/:id",leaguesController.getTeamById);
app.get("/teams/:id/nextfixtures",leaguesController.getTeamFixtures);

//Authorize only authenticated users middleware registration
app.use("/favourites*", function(req, rsp, next) {
    debug("Current user authenticated: %j", req.user);
    if(!req.user) {
        rsp.redirect("/login");
    }
    next();
});
app.get("/favourites/:id",leaguesController.getFavourite);
app.get("/favourites",leaguesController.getFavourites);
app.post("/favourites",leaguesController.postFavouriteAPI);
app.post("/favourite/:id",leaguesController.updateFavourite);
/*Não é nada bonito... mas sem AJAX e sem outros módulos, é o que se arranja
* ver modulo method-override*/
app.post("/favourites/del/:id",leaguesController.deleteFavourite);
app.delete("/favourites/:id",leaguesController.deleteFavouriteAPI);

var port = process.env.PORT || 3000;
server.on("listening", listeningConnections);
server.listen(port);

function listeningConnections() {
  const address = server.address();
  debug("opened server on %j", address);
}

