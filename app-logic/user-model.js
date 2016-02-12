/**
 * Created by cconstantino on 26/01/2016.
 */
"use strict";
const debug = require("debug")("user-model");
const db = require("../app-logic/dbproxy");

/**
 * Constructor function to create an object that represents an user
 * @param user
 * @param pass
 * @returns {User}
 * @constructor
 */
function User(user,pass){
    this.id = user;
    this.pass = pass;

    return this;
}

/**
 * User creation
 * This function puts a new user into database
 * @param username
 * @param pass
 * @param callback what to do when put document in database finishes
 */
function createUser(username,pass,callback){
    var user = new User(username, pass);
    debug("createUser: ",user);
    db.putDocument(db.COUCH_DB_USR,user,undefined,callback);
}

/**
 * gets an user form database
 * @param email
 * @param callback
 */
function getUser(email,callback){
    db.getDocument(db.COUCH_DB_USR,email,function(err,document){
        if(err!==undefined) {
            debug("/user read ERROR:"+err);
            callback(err,undefined);
        } else {
            callback(undefined,document);
        }
    })
}

/**
 * Helper function to allways pass the same object to pages
 * @param user
 * @returns {*} user name to be displayed
 */
function getNameFromUser(user){
    return user?user.name:"";
}

module.exports = {
    createUser:createUser,
    getUser:getUser,
    getNameFromUser:getNameFromUser
};

