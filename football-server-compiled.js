"use strict";

var http = require("http");
var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var debug = require("debug")("football-server");
var hbs = require("express-handlebars");

debug("hbs %j", hbs);

// register the View Helpers
require("./helpers/view/view-helpers")();

var leaguesController = require("./controllers/leagues-controller");

var app = express();

var server = http.createServer(app);

app.set('view engine', 'hbs');

app.use("/", express["static"](path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

// Configure routing
app.get("/leagues", leaguesController.getLeagues);
app.get("/leagues/:id", leaguesController.getLeague);
//app.get("/leagues/favourite", leaguesController.getFavouriteLeagues);
//app.get("/leagues/favourite/:id", leaguesController.getFavouriteById);
//app.post("/leagues/favourite", leaguesController.addFavouriteLeague);
//app.delete("/leagues/favourite/:id", leaguesController.deleteLeagueFromFavourite);
app.get("/fixtures/:id", leaguesController.getLeagueFixture);
//app.get("/teams/:league",leaguesController.getLeagueTeams);
//app.get("/teams/:team",leaguesController.getTeamByName);
//app.get("/players/:team",leaguesController.getTeamPlayers);

server.on("listening", listeningConnections);
server.listen(3000);

function listeningConnections() {
  var address = server.address();
  debug("opened server on %j", address);
}

//# sourceMappingURL=football-server-compiled.js.map