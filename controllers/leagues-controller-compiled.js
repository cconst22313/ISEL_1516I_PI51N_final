'use strict';

var debug = require("debug")("leagues-controller");

var leaguesModel = require("../app-logic/leagues-model");

function getLeagues(req, rsp) {
    debug("/leagues called");
    leaguesModel.getLeagues(function (err, leagues) {
        rsp.render("leagues", { title: "Leagues List", leagues: leagues });
    });
}

function getLeague(req, rsp, next) {
    debug("/league called wit Caption:" + req.params.id);
    //rsp.end("League " + req.params.caption + " requested");
    leaguesModel.getLeague(req.params.id, function (err, league) {
        if (err === undefined) debug("/league read ERROR:" + err);
        debug("/league read:" + league[0].league);
        console.log(league[0].league);
        console.log(league[0]);
        rsp.render("league", { title: league[0].caption, league: league[0] });
    });
}

function getLeagueFixture(req, rsp, next) {
    debug("/league called wit Caption:" + req.params.id);
    //rsp.end("League " + req.params.caption + " requested");
    leaguesModel.getFixtures(parseInt(req.params.id), function (err, fixtures) {
        if (err === undefined) debug("/league read ERROR:" + err);
        debug("/league read:" + fixtures[0]);
        rsp.render("fixtures", { title: fixtures[0], fixtures: fixtures.fixtures });
    });
}
//
//function getTaskById(req, rsp) {
//    rsp.end("Task with id " + req.params.id);
//    debug("/tasks with id");
//
//}
//
//function deleteTask(req, rsp) {
//    rsp.end("delete Task with id " + req.query.id);
//    debug("delete /tasks with id %s", req.params.id);
//}
//
//function createTask(req, rsp) {
//    rsp.end("create Task with id " + req.query.id);
//    debug("create /tasks with id %s", req.params.id);
//
//}

module.exports = {
    getLeagues: getLeagues,
    getLeague: getLeague,
    getLeagueFixture: getLeagueFixture
    //deleteTask: deleteTask,
    //createTask: createTask
};

//# sourceMappingURL=leagues-controller-compiled.js.map