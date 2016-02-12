'use strict';

var http = require("http");
var request = require("request");
var fs = require("fs");

/**
 * Module to access FootballApi a fetch data
 * @returns {{getLeagues:getLeagues, getFixtures:getFixtures, getPlayers:getPlayers, getTeams:getTeams, getLeagueTable:getLeagueTable,
*               getFromApi: getFromApi, getImage: getImage, options: {host: string, path: string}}}
 * @constructor
 */
function FootballAPI() {

    // privates
    var API_KEY = 'e654bec89e924d1c8debc2031e16cb6c';
    var options = {
        host: 'api.football-data.org',
        //path: '/alpha/soccerseasons'
        path: '/v1/soccerseasons'
    };
    var FIXTURE_OPTIONS = {
        host: 'api.football-data.org',
        //path: '/alpha/soccerseasons/$id/fixtures'
        path: '/v1/soccerseasons/$id/fixtures'
    };

    /**
     * Fetches leagues from API
     *
     * @param context execution context
     * @param leagues league list
     * @param callback function to execute when getLeagues is completed
     */
    function getLeagues(context, leagues, callback) {
        console.log("GetLeagues");
        var body = "";
        var request = new http.request(options, processLeagues);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processLeagues(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = [];
                if (leagues != undefined) {
                    leagues.forEach(function (leagueName) {
                        result.push(JSON.parse(body).filter(function (league) {
                            return league.caption === leagueName || league.league === leagueName;
                        })[0]);
                    });
                } else {
                    result = JSON.parse(body);
                }
                //Store leagues in context
                context.addData("leagues", result);
                callback(context, result);
            });
        }
    }

    /**
     * Fetches fixtures from API
     *
     * @param context execution context
     * @param league for fixtures
     * @param callback function to execute when getFixtures ends
     */
    function getFixtures(context, league, callback) {
        console.log("getFixtures");
        var body = "";
        console.log(league);
        var request = new http.request(league._links.fixtures.href, processFixtures);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processFixtures(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                context.addData("fixtures", result);
                callback(context, result);
            });
        }
    }

    /**
     * Fetches fixtures from API using League ID
     *
     * @param context execution context
     * @param leagueId for fixtures
     * @param callback function to execute when getFixtures ends
     */
    function getFixturesByLeagueId(context, leagueId, callback) {
        console.log("getFixtures");
        var body = "";
        console.log(leagueId[0]);
        var fixtureOptions = FIXTURE_OPTIONS;
        fixtureOptions.path = fixtureOptions.path.replace("$id", leagueId[0]);
        var request = new http.request(fixtureOptions, processFixtures);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processFixtures(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = JSON.parse(body);
                //result.leagueName = league.caption;
                //result.leagueCode = league.league;
                context.addData("fixtures", result);
                callback(context, result);
            });
        }
    }
    /**
     * Fetches all teams for a league
     *
     * @param context execution context
     * @param league refereing league for teams
     * @param callback function to be executed when getTeams ends
     */
    function getTeams(context, league, callback) {
        console.log("getTeams");
        var body = "";

        var request = new http.request(league._links.teams.href, processTeams);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processTeams(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                result.teams.forEach(function (team) {
                    team.leagueCode = league.league;
                    team.leagueName = league.caption;

                    team.image = team.name + team.crestUrl.substr(team.crestUrl.length - 4, 4);
                });
                context.addData("teams", result);
                callback(context, result);
            });
        }
    }

    /**
     * Fetches all players of a team
     *
     * @param context execution context
     * @param team refereing team
     * @param callback function to be executed on end
     */
    function getPlayers(context, team, callback, leagueCode, leagueName) {
        console.log("getPlayers");
        var body = "";

        var request = new http.request(team._links.players.href, processPlayers);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processPlayers(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = JSON.parse(body);
                result.teamName = team.name;
                result.teamCode = team.code;

                result.leagueCode = leagueCode;
                result.leagueName = leagueName;

                context.addData("players", result);
                callback(context, result);
            });
        }
    }

    /**
     * Fetches league table from API
     *
     * @param context execution context
     * @param league
     * @param callback function to be executed when request ends
     */
    function getLeagueTable(context, league, callback) {
        console.log("getLeagueTable");
        var body = "";

        var request = new http.request(league._links.leagueTable.href, processLeagueTable);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processLeagueTable(res) {
            res.on("data", function (chunk) {
                body += chunk;
            });

            res.on("end", function () {
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                context.addData("leagueTable", result);
                callback(context, result);
            });
        }
    }
    /**
     * Makes a request to API and sends response trough callback
     *
     * @param icontext object context... has all info!
     * @param id to identify a resource type
     * @param link resource to fetch
     * @param callbackToCaller sends responso to caller
     */
    function getFromApi(icontext, id, link, callbackToCaller) {
        var callerCallback = callbackToCaller;
        var identifier = id;
        var context = icontext;

        /**
         * when server responds this is where that response is handeled
         * @param response
         */
        function httpResponseCallback(response) {
            var httpContent;

            //another chunk of data has been recieved, so append it to `httpContent`
            response.on('data', function (chunk) {
                if (httpContent === undefined) httpContent = chunk;else httpContent += chunk;
            });

            //Response complete. Call callback function to handle data
            response.on('end', function () {
                console.log("Response.END");
                callerCallback(context, identifier, JSON.parse(httpContent));
            });

            //on error, logs an event
            response.on('error', function () {
                console.log("getFromApi Error in HTTP response");
                console.log("Resource asked:" + link);
            });
        }
        if (link != undefined) {
            console.log("getFromApi:" + link);
            var request = http.request(link, httpResponseCallback);
            request.setHeader("X-Auth-Token", API_KEY);
            request.end();
        } else {
            console.log("link:" + link);
            console.log("something weird must have happened...:S");
        }
    }

    /**
     * Fetches image form an URI a saves it to file system
     * Location of file is created based on contex and id
     * @param context execution context.
     * @param id of resource (in case of team: team name, e.g.)
     * @param link URI for image
     * @param callback function
     */
    function getImage(context, id, link, callback) {
        request(link, { encoding: 'binary' }, function (error, response, body) {
            callback(body);
            //fs.writeFile(context.getOutput()+"images\\"+id+link.substr(link.length-4,4), body, 'binary', function (err) {
            //    console.log("API getImage error:"+link);
            //    console.log(err);
            //});
        });
    }

    return {
        getLeagues: getLeagues,
        getFixtures: getFixtures,
        getFixturesByLeagueId: getFixturesByLeagueId,
        getPlayers: getPlayers,
        getTeams: getTeams,
        getLeagueTable: getLeagueTable,
        getFromApi: getFromApi,
        getImage: getImage,
        options: options
    };
}

module.exports = {
    FootballAPI: FootballAPI
};

//# sourceMappingURL=FootballAPI-compiled.js.map