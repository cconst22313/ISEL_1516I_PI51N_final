/**
 * Created by cconstantino on 31/12/2015.
 */
/**
 * Speaks with database.
 * In this case, will by CouchDB
 *
 * DB will have following structure:
 * a group is a document of "favourites" table.
 * A document of favourites will contain 0 or more leagues to follow
 *
 * An example of a favourite:
 * {
   "_id":"osMaiores",
   "_rev":"1-4719e2d827d83b2bc374a86b981625ca",
   "teams":[
      "SLB",
      "Operario"
   ]
}
 *
 * An example of all favourites
 *{
   "total_rows":2,
   "offset":0,
   "rows":[
      {
         "id":"osMaiores",
         "key":"osMaiores",
         "value":{
            "rev":"1-4719e2d827d83b2bc374a86b981625ca"
         }
      },
      {
         "id":"osMaiores2",
         "key":"osMaiores2",
         "value":{
            "rev":"1-f0b5729f54e7b9a9d4d25413b08d3d4b"
         }
      }
   ]
}
 *
 * Notes:
 * When updating a document, "_rev" property must be sent in JSON object:
 * {
    "_rev": "1-f0b5729f54e7b9a9d4d25413b08d3d4b",
    "teams":[
        "Torrejano"
        ]
    }
 *
 */

"use strict";

const debug = require("debug")("dbproxy");

const http = require("http");
const queryString = require("querystring");

//const COUCH_PORT = '5984';
//const COUCH_HOST = '127.0.0.1';

const COUCH_AUTH = 'Basic ' + new Buffer('cconst' + ':' + '123456').toString('base64');

const COUCH_PORT = '';
const COUCH_HOST = "cconst.cloudant.com";
const COUCH_DB_FAV = '/favourites';
const COUCH_DB_USR = '/users';

/**
 * Object with DataBase creation configuration
 * @type {{method: string, host: string, port: string, path: string}}
 */
const dbCreate = {
    method: 'put',
    host: COUCH_HOST,
    port: COUCH_PORT,
    path: COUCH_DB_FAV,
    authentication: COUCH_AUTH
};

function DbCreate(database){
    this.method = 'put';
    this.host = COUCH_HOST;
    //this.port = COUCH_PORT;
    this.path = database;
    this.authentication = COUCH_AUTH;
    return this;
}

/**
 * Object with database Drop configuration
 * @type {{method: string, host: string, port: string, path: string}}
 */
const dbDrop = {
    method: 'delete',
    host: COUCH_HOST,
    port: COUCH_PORT,
    path: COUCH_DB_FAV,
    authentication: COUCH_AUTH
};

/**
 * Constructor function to return an object representing a database
 * @param database
 * @returns {DbDrop}
 * @constructor
 */
function DbDrop(database) {
    this.method = 'delete';
    this.host = COUCH_HOST;
   // this.port = COUCH_PORT;
    this.path = database;
    this.authentication = COUCH_AUTH;
    return this;
}

/**
 * Object with READ Document configuration
 * @type {{method: string, host: string, port: string, path: string}}
 */
const dbGetDocument = {
    method: 'get',
    host: COUCH_HOST,
    port: COUCH_PORT,
    path: COUCH_DB_FAV,
    authentication: COUCH_AUTH
};

/**
 * Constructor function to return an object representing a database to get a document
 * @param database
 * @returns {{}}
 * @constructor
 */
function DbGetDocument(database){
    var obj = {};
    obj.method = 'get';
    obj.host = COUCH_HOST;
    obj.port = COUCH_PORT;
    obj.path = database;
    obj.authentication = COUCH_AUTH;
    return obj;
}

/**
 * Object wit confoguration to PUT document in database
 * @type {{method: string, host: string, port: string, path: string}}
 */
const dbPutDocument = {
    method: 'PUT',
    host: COUCH_HOST,
    port: COUCH_PORT,
    path: COUCH_DB_FAV,
    authentication: COUCH_AUTH
};

/**
 * Constructor fucntion that allows a creation of an object to connect a put a document
 * to a given database
 * @param database
 * @returns {DbPutDocument}
 * @constructor
 */
function DbPutDocument(database){
    this.method = 'put';
    this.host = COUCH_HOST;
    this.port = COUCH_PORT;
    this.path = database;
    this.authentication = COUCH_AUTH;
    return this;
}

/**
 * Object with configuration to delete database
 * @type {{method: string, host: string, port: string, path: string}}
 */
const dbDeleteDocument = {
    method: 'DELETE',
    host: COUCH_HOST,
    port: COUCH_PORT,
    path: COUCH_DB_FAV,
    authentication: COUCH_AUTH
};

/**
 * Constructor fucntion that allows a creation of an object to connect to delete a document
 * from a given database
 * @param database
 * @returns {DbPutDocument}
 * @constructor
 */
function DbDeleteDocument(database){
    this.method = 'DELETE';
    this.host = COUCH_HOST;
    this.port = COUCH_PORT;
    this.path = database;
    this.authentication = COUCH_AUTH;
    return this;
}

/**
 * just to debug and call callback function when a database is created
 * @param callback
 */
function dbCreated(callback) {
    debug("dbCreated");
    callback();
}

/**
 * Initializes Database
 * <BR>
 * Deletes database, when DROP is completed, Creates new database
 * @param database to be inited
 * @param cbInited callback function to be called when init is done
 */
var initDataBase = function(database, cbInited){
    debug("initDataBase: ", database);
    deleteDB(database, function(database,callback){
        createDB(database,cbInited);
    });
    //inited = cbInited;
};

/**
 * Makes a drop os database
 * @database that is going to be deleted
 * @param cbDeleted callback function to be called when DROP is done
 */
var deleteDB = function(database,cbDeleted){
    debug("deleteDB: ", database);
    var request = new http.request(new DbDrop(database),function(res){
        res.on("end",function(){
            cbDeleted(database);
        });
        res.on("error", function(e){
            debug("Error creating databasee - ", e);
        });

    });
    request.end();
};

/**
 *  Creates a database
 *  @param database name to be created
 *  @param callback to be called when database is created
 */
var createDB = function(database,callback){
    debug("createDB: ", database);
    var request = new http.request(new DbCreate(database),function(){
        dbCreated(callback);
    });
    request.end();
};

/**
 * Gets all Documents from database.
 * <br>
 * @param database where all documents are to be fetched
 * @param callback callback to be called when fucntion is done
 */
function getAllDocuments(database,callback){
    debug("getAllDocuments");
    var data = "";
    var request = new http.request(new DbGetDocument(database),reqProcessed);
    request.path = request.path+"/_all_docs";
    debug("getAllDocuments PATH:",request.path);
    request.end();

    function reqProcessed(result){
        result.on("data",function(chunk){
            data += chunk;
        });

        result.on("end",function(){

            var documents = (JSON.parse(data)).rows;
            debug("getFavourites END",documents[0]);
            if (!documents[0]) {
                debug("getFavourites - no data");
                callback("No documents found",undefined);
            } else {
                callback(undefined, documents);
            }
        });

        result.on("error",function(error){
            callback(error,undefined);
        });
    }
}

/**
 * reads a single document from database
 * @param database where request is made
 * @param docId Document id
 * @param callback function to be called when document is read from database
 */
function getDocument(database,docId, callback) {
    debug("getDocument",docId);
    var data = "";
    var request = new http.request(new DbGetDocument(database),reqProcessed);
    request.path = encodeURI(request.path+"/"+docId);
    debug("getDocument PATH:",request.path);
    request.end();

    function reqProcessed(result){
        result.on("data",function(chunk){
            data += chunk;
        });

        result.on("end",function(){
            debug("getDocument END:",JSON.parse(data));
            var document = JSON.parse(data);
            if (!Array.isArray(document.teams)){
                document.teams = [document.teams];
            }
            callback(undefined, document);
        });

        result.on("error", function(e){
            debug("getDocument ERROR:",e);
           callback(e,undefined) ;
        });
    }
}

/**
 * Puts document in database
 * @param database where document is stored
 * @param document JSON document to be written in database
 * @param revision Document revision
 * @param callback Function called when PUT method ends
 */
function putDocument(database,document,revision,callback) {
    debug("putDocument",document["id"]);
    var data = "";
    var request = new http.request( new DbPutDocument(database),reqProcessed);
    request.path = encodeURI(request.path+"/"+document["id"]);
    debug("putDocument PATH:",request.path);
    if (revision!==undefined) {
        document._rev = revision;
        var query = {};
        query.rev=revision;
        //request.path = encodeURI(request.path+"/"+document+"?"+queryString.stringify(query));
    }
    request.write(JSON.stringify(document));
    request.end();

    function reqProcessed(result){

        result.on("data",function(chunk){
            data += chunk;
            debug("putDocument ON DATA");
        });

        result.on("end",function(){
            debug("putDocument END:",JSON.parse(data));
            callback(undefined, JSON.parse(data));
        });

        result.on("error", function(e){
            debug("putDocument ERROR:",e);
            callback(e,undefined) ;
        });
    }

}

/**
 * Deletes a document from database
 * @param database where operation is realized
 * @param document Id of document to be deleted
 * @param callback function called when database responses
 */
function deleteDocumentByID(database, document,callback){
    getDocument(database, document,docRead);

    function docRead(err,doc) {
        deleteDocument(database,document,doc._rev,callback);
    }
}

/**
 * Deletes a document from database...
 * Only deletes if owner is current user
 * @param database Database where deletion is ment to be done
 * @param user authenticated user
 * @param document Id of document to be deleted
 * @param callback function called when database responses
 */
function deleteDocumentByIdOwner(database, user, document,callback){
    debug("deleteDocumentByIdOwner: ",document,user);
    getDocument(database, document,docRead);

    function docRead(err,doc) {

        if (doc["owner"]==user){
            deleteDocument(database,document,doc._rev,callback);
        } else{
            callback({message:"User do not own this document"},undefined);
        }
    }
}

/**
 * Full interface to delete a document
 * @param database where document is going to be deleted
 * @param document Dcument ID to be deleted
 * @param revision revision
 * @param callback function called when database responses
 */
function deleteDocument(database,document,revision,callback) {
    debug("deleteDocument",document);

    var query = {};
    query.rev=revision;
    var data = "";
    var request = new http.request( new DbDeleteDocument(database),reqProcessed);
    /*
    Não gosto desta forma de passar a querystring... mas não encontrei outra forma
    Deveria de dar para afectar uma porpriedade de request... mas nao encontrei  nenhuma
    que dê... :S
    Por agora, fica assim.
     */
    request.path = encodeURI(request.path+"/"+document+"?"+queryString.stringify(query));
    request.write(queryString.stringify(query));
    debug("deleteDocument PATH:",request.path);
    request.end();

    function reqProcessed(result){

        result.on("data",function(chunk){
            data += chunk;
            debug("deleteDocument ON DATA");
        });

        result.on("end",function(){
            debug("deleteDocument END:",JSON.parse(data));
            callback(undefined, JSON.parse(data));
        });

        result.on("error", function(e){
            debug("deleteDocument ERROR:",e);
            callback(e,undefined) ;
        });
    }

}

/**
 * Updates a document in Database, with ID
 * @param database where document is to be updated
 * @param docId Document ID to be updated
 * @param document Document (JSON) with new data
 * @param user authenticated user
 * @param callback function to be called when update is done (or not) in database.
 */
function updateDocument(database,docId,document, user, callback){
    debug("updateFavourite:", document);
    getDocument(database,docId,docRead);

    function docRead(err,doc) {
        document._rev = doc._rev;
        debug("updateFavourite - Revision: ",document._rev);
        debug("Authenticated user: ", user);
        debug("Document owner: ",doc["owner"]);
        if (doc["owner"]===user.name) {
            document["owner"] = doc["owner"];
            putDocument(database, document, doc._rev, callback);
        } else {
            callback({message:"User do not own this document"},undefined);
        }
    }
}

/**
 * gets a document from a database given his IH
 * @param database where document is
 * @param docId identification of document
 * @param callback to be called when operation is completed
 */
function getDocumentId(database,docId,callback){
    debug("etDocumentByField",docId);
    var data = "";
    var request = new http.request(new DbGetDocument(database),reqProcessed);
    request.path = encodeURI(request.path+"/"+docId);
    debug("getDocument PATH:",request.path);
    request.end();

    function reqProcessed(result){
        result.on("data",function(chunk){
            data += chunk;
        });

        result.on("end",function(){
            debug("getDocument END:",JSON.parse(data));
            var document = JSON.parse(data);
            if (!Array.isArray(document.teams)){
                document.teams = [document.teams];
            }
            callback(undefined, document);
        });

        result.on("error", function(e){
            debug("getDocument ERROR:",e);
            callback(e,undefined) ;
        });
    }
}

module.exports = {
    COUCH_DB_FAV:COUCH_DB_FAV,
    COUCH_DB_USR:COUCH_DB_USR,
    init:initDataBase,
    getFavourites:getAllDocuments,
    getFavourite:getDocument,
    putDocument:putDocument,
    deleteFavourite:deleteDocumentByID,
    deleteDocument:deleteDocument,
    updateFavourite:updateDocument,
    getDocument:getDocument,
    deleteDocumentByIdOwner:deleteDocumentByIdOwner
};
