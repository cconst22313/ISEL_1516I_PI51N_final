"use strict";

var api = require("./../fromFicha1/FootballAPI.js").FootballAPI();
var context = require("./../fromFicha1/Context.js");
var debug = require("debug")("leagues-model");

/**
 * 
 * @type {*[]}
 */

var leagues = [{
    "league": "PD",
    "caption": "Primeira Divisao",
    "year": "2015/2015",
    "numberOfTeams": "30",
    "numberOfGames": "60",
    "lastUpdated": "15/12/2015"
}, {
    "league": "PL",
    "caption": "Premiere League",
    "year": "2015/2015",
    "numberOfTeams": "30",
    "numberOfGames": "60",
    "lastUpdated": "15/12/2015"
}];

function getLeagues(leaguesCb) {
    debug("getLeagues");
    var ctx = new context.Context();
    api.getLeagues(ctx, null, leaguesCb);
    //leaguesCb(null, leagues);
}

function getLeague(league, leagueCb) {
    debug("/leagues/caption");
    var ctx = new context.Context();
    api.getLeagues(ctx, [league], leagueCb);
    //rsp.end("League with Caption" + req.params.caption);
}

function getFixtures(league, fixturesCb) {
    debug("/fixtures/caption");
    var ctx = new context.Context();
    api.getFixturesByLeagueId(ctx, [league], fixturesCb);
    //rsp.end("League with Caption" + req.params.caption);
}

function deleteTask(req, rsp) {
    rsp.end("delete Task with id " + req.query.id);
    debug("delete /tasks with id %s", req.params.id);
}

function createTask(req, rsp) {
    rsp.end("delete Task with id " + req.query.id);
    debug("delete /tasks with id %s", req.params.id);
}

module.exports = {
    getLeagues: getLeagues,
    getLeague: getLeague,
    getFixtures: getFixtures,
    deleteTask: deleteTask,
    createTask: createTask
};

//# sourceMappingURL=leagues-model-compiled.js.map