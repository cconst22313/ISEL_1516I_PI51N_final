"use strict";

const api = require("./../fromFicha1/FootballAPI.js").FootballAPI();
const context = require("./../fromFicha1/Context.js");
const debug = require("debug")("leagues-model");
const db = require("../app-logic/dbproxy");

/**
 * Some initial data... used for testing...
 * @type {*[]}
 */
var leagues = [
    {
        "league": "PD",
        "caption": "Primeira Divisao",
        "year": "2015/2015",
        "numberOfTeams": "30",
        "numberOfGames": "60",
        "lastUpdated": "15/12/2015"
    },
    {
        "league": "PL",
        "caption": "Premiere League",
        "year": "2015/2015",
        "numberOfTeams": "30",
        "numberOfGames": "60",
        "lastUpdated": "15/12/2015"
    }
];


var leaguesCache = [];
var teamsCache = [];


/**
 * Helper function, that given a URI with team ID at the end of if, reurns its ID.
 * <br>
 * example: for http://api.football-data.org/v1/teams/524, this function returns 524
 * @param team URI
 * @returns {*} id
 */
function getTeamId(team) {
    debug(team.caption,team.match(/\d*$/)[0]);
    return team.match(/\d*$/)[0];
}

/**
 * Asks api to get all leagues.
 *
 * @param leaguesCb callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getLeagues(leaguesCb) {
    debug("getLeagues");
    var ctx = new context.Context();
    if (leaguesCache.length == 0) {
        debug("getLeagues form API");
        api.getLeagues(ctx,undefined,function(err,leagues){
            leaguesCache = leagues;
            leaguesCb(err,leagues);
        });
    } else{
        debug("getLeagues form cache");
        leaguesCb(undefined,leaguesCache);
    }

    //leaguesCb(null, leagues);
}

/**
 * Asks API for a specific league
 * @param league Id of asked league
 * @param leagueCb callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getLeague(league,leagueCb) {
    debug("/leagues/:id");
    var ctx = new context.Context();
    api.getLeague(ctx,league,function(ctx,league){
        if (league===undefined) leagueCb({error: "no league read"},undefined);
        else leagueCb(undefined,league);
    });
}

/**
 * Asks API for fixtures of a league
 * @param league Id of asked league
 * @param fixturesCb callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getFixtures(league,fixturesCb) {
    debug("/fixtures/caption");
    var ctx = new context.Context();
    api.getFixturesByLeagueId(ctx,[league], function(err, fixtures){
        fixtures.fixtures.forEach(fixture=>{
            fixture.homeTeamId = getTeamId(fixture._links.homeTeam.href);
            fixture.awayTeamId = getTeamId(fixture._links.awayTeam.href);
        });
        fixturesCb(err, fixtures);
    });
}

/**
 * Asks API for all teams of a given array of leagues
 * @param leagues array of leagues
 * @param teamsCb callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getTeams(leagues,teamsCb) {
    debug("getTeams", teamsCache.length);
    var ctx = new context.Context();
    if (teamsCache.length == 0) {
        debug("getTeams from API");
        api.getTeamsByLeagueIds(ctx, leagues, function(error,teams){
            teamsCache = teams;
            teamsCb(error,teams);
        });
    } else{
        debug("getTeams from cache");
        teamsCb(undefined,teamsCache);
    }
    //rsp.end("League with Caption" + req.params.caption);
}

/**
 * Asks API for a specific team
 * @param teamId Id of asked team
 * @param teamCb callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getTeam(teamId,teamCb) {
    debug("getTeamId",teamId);
    var ctx = new context.Context();
    api.getTeam(ctx,teamId,teamCb);
}

/**
 * Asks API for all teams!
 * <br>
 * To get all teams, first one needs to get all leagues. With an Array of teams, then fetches teams for leagues
 * @param callback callback to be called when this function ends. This returns error object and an Array of leagues
 */
function getAllTeams(callback){
    debug("getAllTeams");
    var teams = [];
    var leagueIds = [];

    getLeagues((ctx, leagues) => {
        debug("Favourites - getLeagues");
        if (leagues === undefined) {
            debug("/leagues read ERROR:");
            debug(err);
        }
        //var league;
        //for(league in leagues){
        //    leagueIds.push(league.id);
        //}
        leagues.forEach(league=> {
            leagueIds.push(league.id);
        });
        debug(leagueIds);

        getTeams(leagueIds, (err, teamsList) => {
            debug("Favourites - getTeams");
            teams = teamsList;
            //teams.forEach(team=>{
            //    if (team!==undefined) debug(team.name);
            //});
            callback(err,teams);
        });
    });
}

/**
 * Gets Favourites from database. When done, calls callback routine
 * @param callback
 */
function getFavourites(callback){
    debug("getFavourites");
    //db.getFavourites(db.COUCH_DB_FAV,callback);
    let count = 0;
    let favs = [];
    db.getFavourites(db.COUCH_DB_FAV,function(err,favourites){
        if (!favourites) {
            debug("No faavourites found", err);
            callback(err, favs);
        } else {
            favourites.forEach(fav=> {
                db.getDocument(db.COUCH_DB_FAV, fav.id, function (err, f) {
                    if (!err) {
                        favs.push(f);
                        debug("Add favourite:", f);
                        if (++count == favourites.length) {
                            callback(err, favs);
                        }
                    } else {
                        debug("getFavourites ERROR: ", err);
                        callback(err, favs);
                    }
                })
            });
        }

    });
}


/**
 * fetches a favourite detail (with his teams) from database.
 * <br>
 * First Favourite is fetched from database, them all his teams from API
 * @param id favourite Id
 * @param callback function to be called when done
 */
function getFavourite(id,callback){
    debug("getFavourites");
    var teamsIDs = [];
    var teams = [];
    var fav = {};
    db.getFavourite(db.COUCH_DB_FAV,id,function(err,favourite){
        if(err!==undefined) {
            debug("/favourites/:id read ERROR:"+err);
            callback(err,undefined);
        } else {
            fav = favourite;
            debug("/favourites/:id read" + favourite);
            teamsIDs = favourite.teams;
            debug("/favourites/ - teams read", teamsIDs.length);
            var nrTeams = 0;
            if (teamsIDs.length>0) {
                debug(teamsIDs);
                teamsIDs.forEach(id=> {
                    getTeam(id, function (err, team) {
                        teams = teams.concat(team);
                        debug("team & of &",nrTeams+1,teamsIDs.length);
                        debug("=====================CURR TEAM====================");
                        debug(team);
                        if (++nrTeams === teamsIDs.length) {
                            fav.teams = teams;
                            debug("=====================ALL TEAMS====================");
                            debug(fav.teams);
                            callback(undefined,fav);
                        }
                    });
                })
            } else callback({err_desc:"no teams read",err_id:"1"},undefined);
        }
    });
}
/**
 * Gets fixtures of a given team
 * @param id team Id
 * @param callback function to be called when done
 */
function getTeamFixtures(id,callback){
    debug("getTeamFixtures");
    api.getFixturesForTeamId(new context.Context(),id,(ctx,fixtures)=>{
        fixtures = fixtures.fixtures;
        fixtures.forEach(fixture=>{
            fixture.homeTeamId = getTeamId(fixture._links.homeTeam.href);
            fixture.awayTeamId = getTeamId(fixture._links.awayTeam.href);
        });
        callback(undefined,fixtures);
    });

}

/**
 * Adds a favourite to database
 * @param favourite Object ready to be putted into database
 * @param callback function to be executed when done
 */
function addFavourite(favourite,callback){
    db.putDocument(db.COUCH_DB_FAV,favourite,undefined,callback);
}

/**
 * Orders database to delete a FAvourite referenced by ID
 * @param id Id of to be deleted
 * @param user current user
 * @param callback function to be called when done
 */
function deleteFavourite(id,user, callback){
    debug("deleteFavourite",id);
    //db.deleteFavourite(db.COUCH_DB_FAV,id,callback);
    db.deleteDocumentByIdOwner(db.COUCH_DB_FAV,user,id,callback)
}

/**
 * Orders database to update a FAvourite referenced by ID
 * @param id Id of to be deleted
 * @param callback function to be called when done
 */
function updateFavourite(id, favourite, user, callback){
    db.updateFavourite(db.COUCH_DB_FAV, id, favourite, user, callback);
}


module.exports = {
    getLeagues: getLeagues,
    getLeague: getLeague,
    getFixtures:getFixtures,
    getTeams:getTeams,
    getTeam:getTeam,
    getAllTeams:getAllTeams,
    getFavourites:getFavourites,
    getFavourite:getFavourite,
    getTeamFixtures:getTeamFixtures,
    addFavourite:addFavourite,
    deleteFavourite:deleteFavourite,
    updateFavourite:updateFavourite
};

