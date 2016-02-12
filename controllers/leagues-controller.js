'use strict';

const debug = require("debug")("leagues-controller");
const leaguesModel = require("../app-logic/leagues-model");
const userModel = require("../app-logic/user-model");
const db = require("../app-logic/dbproxy");

/**
 * Given an extractor, this function returns an array of unique entries
 * <br>
 * The extractor is a function (optional) that gets from object wich member to compare.
 * If no extractor is given, its assumed the object it self.
 *
 * @param keyExtractor function to get object member (optional)
 * @returns {Array.<T>} An array of unique elements
 */
Array.prototype.unique = function (keyExtractor) {
    keyExtractor = keyExtractor || (e => e) ;
    var keys = this.map(keyExtractor);
    return this.filter((elem,pos)=> keys.indexOf(keyExtractor(elem))==pos )
};

/**
 * Entry point for /leagues, method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests
 * Express engine to responds
 *
 * @param req Express request parameter
 * @param rsp Express response parameter
 */
function getLeagues(req, rsp) {
    debug("/leagues called");
    leaguesModel.getLeagues((err, leagues) => {
        if (err!==undefined) {
            debug("/leagues read ERROR:");
            debug(err);
        }
        rsp.render("leagues", {title: "Leagues List", leagues: leagues,user:userModel.getNameFromUser(req.user) })
    });
}

/**
 * Entry point for /leagues/:id, method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests
 * Express engine to responde
 * @param req
 * @param rsp
 * @param next
 */
function getLeague(req, rsp,next) {
    debug("/league called wit Caption:"+req.params.id);
    //rsp.end("League " + req.params.caption + " requested");
    leaguesModel.getLeague(req.params.id,(err, league) => {
        if (err!==undefined) debug("/league read ERROR:"+err);
        debug("/league read:"+league);
        rsp.render("league", {title: league.caption, league: league,user:userModel.getNameFromUser(req.user) })
    });
}

/**
 * Entry point for /leagues:id/fixtures, method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests
 * Express engine to responde
 *
 * @param req
 * @param rsp
 * @param next
 */
function getLeagueFixture(req, rsp,next) {
    debug("/Fixtures for:"+req.params.id);
    let myLeague;
    leaguesModel.getLeague(req.params.id,(err, league) => {
        if (err!==undefined) debug("/league read ERROR:"+err);
        debug("/league read:"+league);
        myLeague = league;
        leaguesModel.getFixtures(parseInt(req.params.id),(err, fixtures) => {
            if (err===undefined) debug("/league read ERROR:"+err);
            debug("/fixtures read:"+fixtures[0]);
            rsp.render("fixtures", {title: fixtures[0], league:myLeague, fixtures: fixtures.fixtures,user:userModel.getNameFromUser(req.user)})
        });
    });
}

/**
 * Entry point for /leagues/:id/teams, method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests
 * Express engine to responds
 * @param req
 * @param rsp
 * @param next
 */
function getLeagueTeams(req, rsp,next) {
    debug("/teams for:"+req.params.id);
    leaguesModel.getTeams(parseInt(req.params.id),(err, fixtures) => {
        if (err!==undefined) debug("/league read ERROR:"+err);
        debug("/teams read:"+fixtures[0]);
        rsp.render("teams", {title: fixtures[0], fixtures: fixtures.fixtures })
    });
}

/**
 * Entry point for /favourites method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests Express engine to responds
 * <br>
 * In this resource, exists a dropdown to be filled with all teams.
 * This data needs to requested to leagues-model to (getAllTeams)
 *
 * @param req
 * @param rsp
 * @param next
 */
function getFavourites(req,rsp,next) {
    debug("/favourites");
    debug(req.user);
    var myTeams = [];
    if (req.user) {
        leaguesModel.getAllTeams((err, teams) => {
            myTeams = teams;
            leaguesModel.getFavourites(render);
        });
    }

    function render(err,favourites){
        debug("Favourites Render");
        if(err!==undefined) {
            debug("/favourites read ERROR:"+err);
            rsp.code = '404';
        //    rsp.end();
        }
        favourites.forEach(fav=> {
            debug(fav);
            debug(fav.owner);
            if (req.user!==undefined) {
                debug(req.user["name"]);
                if (fav.owner != req.user["name"]) {
                    fav.disabled = "disabled";
                } else {
                    fav.disabled = "";
                }
            }
        });
        rsp.render("favourites", {
            title: "Favourites",
            favourites: favourites,
            teams: myTeams,
            user:userModel.getNameFromUser(req.user)
        });

    }
}

/**
 * Entry point for /favourites/:id method GET
 * <br>
 * This function makes a call to league-model asking for data an when its done, rquests Express engine to responds
 * <br>
 * In this resource, exists a dropdown to be filled with all teams.
 * This data needs to requested to leagues-model to (getAllTeams)
 *
 * @param req
 * @param rsp
 * @param next
 */
function getFavourite(req,rsp,next){
    debug("getFavourite");
    debug("/favourites/",req.params.id);
    var myTeams = [];

    if (req.user) {
        leaguesModel.getAllTeams((err, teams) => {
            myTeams = teams;
            leaguesModel.getFavourite(req.params.id, render);
        });
    }

    function render(err,fav){
        //debug("render favourite - Teams:", fav.teams);
        debug("render favourite - myTeams:", myTeams);
        myTeams.forEach(t => {
            if (fav.teams.some(elem=>{
                    if( elem.id === t.id ) return true;
                })){
                t.selected = "selected";
                debug("team selected",t.name);
            } else {
                t.selected = "";
            }

        });
        debug(fav.owner);
        if (fav.owner != req.user["name"]){
            fav.disabled = "disabled";
        } else {
            fav.disabled = "";
        }
        rsp.render("favourite",{title:"Favourite Group: "+fav._id,favourite:fav,teamsDD:myTeams.unique(elem=>elem.id),user:userModel.getNameFromUser(req.user)});
    }
}

/**
 * Entry point for /favourites, method POST
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 * <br>
 * Method POST is used so it can be passed the ID. This were an implementation detail... *
 *
 * @param req
 * @param rsp
 * @param next
 */
function postFavourite(req,rsp,next) {
    debug("postFavourite");
    debug(req.body);
    //debug(req);
    var favourite = req.body;
    favourite.id = favourite.groupName;
    favourite.owner = req.user.name;
    leaguesModel.addFavourite(favourite,favouriteCreated);

    function favouriteCreated(err,favourite) {
        debug("favouriteCreated");
        if(err!==undefined) {
            debug(err);
            rsp.code = 400;
        }
        else {
            debug(favourite);
            rsp.code = 302;
        }
        rsp.redirect(req.url);
    }
}

/**
 * Entry point for /favourites, method POST
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 * <br>
 * Method POST is used so it can be passed the ID. This were an implementation detail... *
 *
 * @param req
 * @param rsp
 * @param next
 */
function postFavouriteAPI(req,rsp,next) {
    debug("postFavourite");
    debug(req.body);
    //debug(req);
    var favourite = req.body;
    favourite.id = favourite.groupName;
    favourite.owner = req.user.name;
    leaguesModel.addFavourite(favourite,favouriteCreated);

    function favouriteCreated(err,favourite) {
        debug("favouriteCreated");
        if(err!==undefined) {
            debug(err);
            rsp.code = 400;
            rsp.end();
        }
        else {
            debug(favourite);
            //rsp.code = 200;
            favourite.layout = false;
            rsp.render("partials/favourite",favourite);
        }

    }
}

/**
 * Entry point for /favourites/del/:id, method POST
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 *
 * This is a special case: To delete something on the server, one cannot make use of FORMs in
 * web browser. It could be done using AJAX and XMLHttpRequest (http://www.w3schools.com/ajax/ajax_xmlhttprequest_create.asp)
 *
 * @param req
 * @param rsp
 * @param next
 */
function deleteFavourite(req,rsp,next) {
    debug("deleteFavourite",req.params.id);
    debug(req.body);
    //debug(req);
    var favourite = req.body;
    favourite.id = favourite.groupName;
    leaguesModel.deleteFavourite(req.params.id,req.user["name"],favouriteDeleted);

    function favouriteDeleted(err,favourite) {
        debug("favouriteDeleted");
        if(err!==undefined) {
            debug(err);
            rsp.code = 400;
        }
        else {
            debug(favourite);
            rsp.code = 302;
        }
        rsp.redirect("/favourites");
    }
}

/**
 * Entry point for /favourites/del/:id, method DELETE
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 *
 * This is a special case: To delete something on the server, one cannot make use of FORMs in
 * web browser. It could be done using AJAX and XMLHttpRequest (http://www.w3schools.com/ajax/ajax_xmlhttprequest_create.asp)
 *
 * @param req
 * @param rsp
 * @param next
 */
function deleteFavouriteAPI(req,rsp,next) {
    debug("deleteFavourite",req.params.id);
    debug(req.body);
    //debug(req);
    var favourite = req.body;
    favourite.id = favourite.groupName;
    leaguesModel.deleteFavourite(req.params.id,req.user["name"],favouriteDeleted);

    function favouriteDeleted(err,favourite) {
        debug("favouriteDeleted");
        if(err!==undefined) {
            debug(err);
            rsp.code = 400;
            rsp.end("Error deleting Favourite " + req.params.id);
        }
        else {
            debug(favourite);
            rsp.end(JSON.stringify({id: req.params.id}));
        }
    }
}


/**
 * Entry point for /favourites, method POST
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 *
 * @param req
 * @param rsp
 * @param next
 */
function updateFavourite(req,rsp,next) {
    debug("updateFavourite",req.params.id);
    debug(req.body);
    var redirect = "/favourites/"+req.params.id;
    debug("updateFavourite redirect path:", redirect);
    //debug(req);
    var favourite = req.body;
    favourite.id = favourite.groupName;
    leaguesModel.updateFavourite(req.params.id,favourite, req.user ,favouriteUpdated);

    function favouriteUpdated(err,favourite) {
        debug("favouriteUpdated");
        if(err!==undefined) {
            debug(err);
            rsp.code = 400;
        }
        else {
            debug(favourite);
            rsp.code = 302;
        }
        rsp.redirect(redirect);
    }
}

/**
 * Entry point for /teams/:id/nextfixtures, method GET
 * <br>
 * This function makes a call to league-model posting data an when its done, rquests Express engine to responds
 * with a redirect to original resourse
 * <br>
 * Before fixture fetching, needs to get corresponding team.
 *
 * @param req
 * @param rsp
 * @param next
 */
function getTeamFixtures(req,rsp,next) {
    debug("getTeamFixtures");
    var myTeam = {};
    var nFixtures = req.query["nrfixtures"];
    var favourite = req.query["favourite"];
    leaguesModel.getTeam(req.params.id,getFixtures);

    function getFixtures(ctx,team){
        myTeam = team;
        leaguesModel.getTeamFixtures(team.id,renderFixtures);
    }

    function renderFixtures(err,fixtures){
        debug("renderFixtures");
        var myFixtures;

        var currDate = new Date();
        var count = 0;
        myFixtures = (fixtures.filter(function (fixture) {
            var fixtureDate = new Date(fixture.date.substr(0,10));
            if(count==nFixtures) return false;
            if (fixtureDate >= currDate){
                ++count;
                //debug(fixtureDate,currDate);
                return true;
            }
        }));

        rsp.render("fixtures",{title:"Fixures for "+myTeam.name, fixtures:myFixtures, favId:favourite,user:userModel.getNameFromUser(req.user)});
    }
}


function getTeamById(req,rsp,next) {
    leaguesModel.getTeam(req.params.id,function(ctx,team){
        rsp.render("team",{title:team.name+" Detail", team:team,user:userModel.getNameFromUser(req.user)});
    });
}
module.exports = {
    getLeagues: getLeagues,
    getLeague: getLeague,
    getLeagueFixture:getLeagueFixture,
    getLeagueTeams:getLeagueTeams,
    getFavourites:getFavourites,
    getFavourite:getFavourite,
    postFavourite:postFavourite,
    postFavouriteAPI:postFavouriteAPI,
    deleteFavourite:deleteFavourite,
    deleteFavouriteAPI:deleteFavouriteAPI,
    updateFavourite:updateFavourite,
    getTeamFixtures:getTeamFixtures,
    getTeamById:getTeamById
};
