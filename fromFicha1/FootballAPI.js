'use strict';

const http = require("http");
const request = require("request");
const fs = require("fs");
const debug = require("debug")("FootballAPI");


/**
 * Module to access FootballApi a fetch data
 * @returns {{getLeagues:getLeagues, getFixtures:getFixtures, getPlayers:getPlayers, getTeams:getTeams, getLeagueTable:getLeagueTable,
*               getFromApi: getFromApi, getImage: getImage, options: {host: string, path: string}}}
 * @constructor
 */
function FootballAPI() {

    // privates
    const API_KEY = 'e654bec89e924d1c8debc2031e16cb6c';
    const options = {
        host: 'api.football-data.org',
        //path: '/alpha/soccerseasons'
        path: '/v1/soccerseasons'
    };
    const FIXTURE_OPTIONS = {
        host: 'api.football-data.org',
        path: '/v1/soccerseasons/$id/fixtures'
    };

    function TeamsOptions() {
        return {
            host: 'api.football-data.org',
            path: '/v1/soccerseasons/$id/teams'
        };
    }

    function TeamOptions(){
        return {
            host: 'api.football-data.org',
            path: '/v1/teams/$id'
        };
    }

    function LeagueOptions(){
        return {
            host: 'api.football-data.org',
            path: '/v1/soccerseasons/$id'
        };
    }

    function TeamFixtures(){
        return {
            host: 'api.football-data.org',
            path: '/v1/teams/$id/fixtures'
        }
    }

    /**
     * Fetches leagues from API
     *
     * @param context execution context
     * @param leagues league list
     * @param callback function to execute when getLeagues is completed
     */
    function getLeagues(context,leagues,callback){
        debug("GetLeagues");
        var body = "";
        var request = new http.request(options, processLeagues);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processLeagues(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = [];
                if (leagues!=undefined) {
                    leagues.forEach(leagueName=> {
                        result.push(JSON.parse(body).filter(function (league) {
                            return league.caption === leagueName || league.league === leagueName;
                        })[0]);
                    });
                } else {
                    result = JSON.parse(body);
                }
                //Store leagues in context
                context.addData("leagues",result);
                debug(result);
                callback(context,result);
            })
        }
    }

    /**
     * Fetches fixtures from API
     *
     * @param context execution context
     * @param league for fixtures
     * @param callback function to execute when getFixtures ends
     */
    function getFixtures(context,league, callback){
        debug("getFixtures");
        var body = "";
        debug(league);
        var request = new http.request(league._links.fixtures.href, processFixtures);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processFixtures(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                context.addData("fixtures",result);
                callback(context,result);
            })
        }
    }

    /**
     * Fetches fixtures from API using League ID
     *
     * @param context execution context
     * @param leagueId for fixtures
     * @param callback function to execute when getFixtures ends
     */
    function getFixturesByLeagueId(context,leagueId, callback){
        debug("getFixturesByLeagueId");
        var body = "";
        debug(leagueId[0]);
        var fixtureOptions = FIXTURE_OPTIONS;
        fixtureOptions.path=fixtureOptions.path.replace("$id",leagueId[0]);
        var request = new http.request(fixtureOptions, processFixtures);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processFixtures(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                //result.leagueName = league.caption;
                //result.leagueCode = league.league;
                context.addData("fixtures",result);
                callback(context,result);
            })
        }
    }

    function getFixturesForTeamId(context,id,callback){
        debug("getFixturesForTeamId");
        var body = "";
        debug(id);
        var fixtureOptions = new TeamFixtures();
        fixtureOptions.path=fixtureOptions.path.replace("$id",id);
        var request = new http.request(fixtureOptions, processFixtures);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processFixtures(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                //result.leagueName = league.caption;
                //result.leagueCode = league.league;
                context.addData("fixtures",result);
                callback(context,result);
            })
        }
    }

    /**
     * Fetches all teams for a league
     *
     * @param context execution context
     * @param league refereing league for teams
     * @param callback function to be executed when getTeams ends
     */
    function getTeams(context,league, callback){
        debug("getTeams");
        var body = "";

        var request = new http.request(league._links.teams.href, processTeams);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processTeams(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                result.teams.forEach(team=>{
                    team.leagueCode=league.league;
                    team.leagueName=league.caption;

                    team.image=team.name+team.crestUrl.substr(team.crestUrl.length-4,4);
                });
                context.addData("teams",result);
                callback(context,result);
            })
        }
    }

    /**
     * Fetches all teams for a league by ID
     *
     * @param context execution context
     * @param leagueId league ID for teams
     * @param callback function to be executed when getTeams ends
     */
    function getTeamsByLeagueIds(context,leagueIDs, callback){
        //debug("getTeamsByLeagueIds:", leagueIDs);

        var teams = [];
        var nrCalls = 0;
        leagueIDs.forEach(leagueId=> {
            getTeamsByLeagueId(context, leagueId, function(ctx,_teams){
                teams = teams.concat(_teams);
                if(++nrCalls==leagueIDs.length) {
                    teams.forEach(team=>{
                        if (team!== undefined) team.id = team._links.self.href.match(/\d*$/)[0];
                    });
                    callback(undefined,teams);
                }
            });
        });
    }

    /**
     * Fetches all teams for a league by ID
     *
     * @param context execution context
     * @param leagueId league ID for teams
     * @param callback function to be executed when getTeams ends
     */
    function getTeamsByLeagueId(context,leagueId, callback){
        //debug("getTeamsByLeagueIds:", leagueIDs);

        let myTeamsOptions = new TeamsOptions();

        let body = "";
        debug("original path: "+myTeamsOptions.path);
        debug("league ID requested: "+leagueId);
        myTeamsOptions.path = myTeamsOptions.path.replace("$id",leagueId);
        debug("league path requested: "+myTeamsOptions.path);
        var request = new http.request(myTeamsOptions, processTeams);

        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processTeams(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                callback(context, result.teams);
            })
        }
    }

    /**
     * Fetches all players of a team
     *
     * @param context execution context
     * @param team refereing team
     * @param callback function to be executed on end
     */
    function getPlayers(context,team, callback, leagueCode, leagueName){
        debug("getPlayers");
        var body = "";

        var request = new http.request(team._links.players.href, processPlayers);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processPlayers(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                result.teamName = team.name;
                result.teamCode = team.code;

                result.leagueCode=leagueCode;
                result.leagueName=leagueName;

                context.addData("players",result);
                callback(context,result);
            })
        }
    }

    /**
     * Fetches league table from API
     *
     * @param context execution context
     * @param league
     * @param callback function to be executed when request ends
     */
    function getLeagueTable(context,league, callback){
        debug("getLeagueTable");
        var body = "";

        var request = new http.request(league._links.leagueTable.href, processLeagueTable);
        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processLeagueTable(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                result.leagueName = league.caption;
                result.leagueCode = league.league;
                context.addData("leagueTable",result);
                callback(context,result);
            })
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
    function getFromApi(icontext,id,link,callbackToCaller){
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
                if (httpContent === undefined) httpContent = chunk;
                else httpContent += chunk;
            });

            //Response complete. Call callback function to handle data
            response.on('end', function () {
                debug("Response.END");
                callerCallback(context,identifier, JSON.parse(httpContent));
            });

            //on error, logs an event
            response.on('error',function(){
                debug("getFromApi Error in HTTP response");
                debug("Resource asked:"+link);
            })
        }
        if (link!=undefined) {
            debug("getFromApi:" + link);
            var request = http.request(link, httpResponseCallback);
            request.setHeader("X-Auth-Token", API_KEY);
            request.end();
        } else {
            debug("link:"+link);
            debug("something weird must have happened...:S");
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
    function getImage(context,id,link,callback){
        request(link, {encoding: 'binary'}, function(error, response, body) {
            callback(body);
            //fs.writeFile(context.getOutput()+"images\\"+id+link.substr(link.length-4,4), body, 'binary', function (err) {
            //    debug("API getImage error:"+link);
            //    debug(err);
            //});
        });
    }

    function getTeam(context,id,callback){
        let teamOptions = new TeamOptions();

        let body = "";

        debug("Team ID requested: "+id);
        teamOptions.path = teamOptions.path.replace("$id",id);
        debug("Team path requested: "+teamOptions.path);
        var request = new http.request(teamOptions, processTeam);

        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processTeam(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                debug(result);
                if (result._links===undefined) callback(context, undefined);
                else {
                    result.id = result._links.self.href.match(/\d*$/)[0];
                    callback(context, result);
                }
            });

            res.on("err",function(e){
                debug("Erro!:",e);
                callback(context, undefined);
            })
        }
    }

    function getLeague(context,id,callback){
        debug("getLeague",id);
        let leagueOptions = new LeagueOptions();
        let body = "";
        leagueOptions.path = leagueOptions.path.replace("$id",id);
        debug("League path requested: "+leagueOptions.path);
        var request = new http.request(leagueOptions, processLeague);

        request.setHeader("X-Auth-Token", API_KEY);
        request.end();

        function processLeague(res){
            res.on("data",function(chunk){
                body += chunk;
            });

            res.on("end",function(){
                var result = JSON.parse(body);
                debug(result);
                callback(context, result);
            });

            res.on("err",function(e){
                callback(context, undefined);
            })
        }
    }

    return{
        getLeagues:getLeagues,
        getFixtures:getFixtures,
        getFixturesByLeagueId:getFixturesByLeagueId,
        getPlayers:getPlayers,
        getTeams:getTeams,
        getTeamsByLeagueIds:getTeamsByLeagueIds,
        getLeagueTable:getLeagueTable,
        getFromApi:getFromApi,
        getImage:getImage,
        getTeam:getTeam,
        getFixturesForTeamId:getFixturesForTeamId,
        getLeague:getLeague,
        options:options
    }

}

module.exports = {
    FootballAPI: FootballAPI
};