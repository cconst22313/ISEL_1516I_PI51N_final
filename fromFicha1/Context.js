'use strict';

/**
 * Application Context
 * Instatiated for each command line
 * Is context that knows wich execution must be started
 */
function Context() {

    // privates
    var file = "";
    var leagues = [];
    var generate = [];
    var output = "";
    var usage = "";
    var data = [];

    /**
     * Map to each option and corresponding set data function
     */
    var populateContext = { "-file": setFile,
                            "-leagues": setLeagues,
                            "-generate": setGenerate,
                            "-output": setOutput,
                            "-usage": setUsage };

    /**
     * Sets file
     * @param array
     * @param index
     */
    function setFile(array,index) {
        file = array[index + 1];
        console.log("File name: " + file);
    }

    /**
     * Sets leagues with leagues data.
     * Several requests, gives several leagues
     *
     * @param array leagues array
     * @param index position
     */
    function setLeagues(array, index) {
        var idx = index + 1;
        var league = "";
        while (array[idx].charAt(0) !== "-") {
            league = league + " " + array[idx++];
        }
        league = league.replace(/['"]+/g,"");
        leagues = league.split(",");
        console.log("Leagues: " + league);
        leagues.forEach(function(val, index, array){
            array[index] = array[index].trim();
            console.log("-"+array[index]);
        });
    }

    /**
     * For each league, adds a list of features to generate
     * @param array fixtures
     * @param index league index
     */
    function setGenerate(array,index) {
        generate = array[index + 1].split(",");
        console.log("Generate Option: " + array[index + 1] );
        generate.forEach(function(val){
            console.log("-"+val);
        });
    }

    /**
     * Sets output destination for each league passed in command line
     * @param array of output destination
     * @param index league index
     */
    function setOutput(array,index) {
        output = array[index + 1];
        console.log("Output path: " + output);
    }

    /**
     * Usage...
     * description of command
     */
    function setUsage(){
        usage =
            "Football Data HTML Generator\n\r"+
            "Usage: node football-data.js \<options>\n\r"+
            "Where options include:\n\r"+
            "-usage Shows the application usage\n\r"+
            "-file \<file-path> Reads all arguments from the text file in <file-path>\n\r"+
            "-leagues \<leagues-list> A comma separated list of the league names or its short"+
            "names (e.g Primeira Liga, 2015/2016, PD)\n\r"+
            "-generate [teams|fixtures|leagueTable|players] What to generate. A comma"+
            "separated list of the defined values.\n\r"+
            "-output <dir-path> Path to output directory where files are generated.";
        console.log("Usage: " + usage);
        process.exit(0);
    }

    /**
     * Adds arguments parsed into context
     * @param val argument name
     * @param index league index
     * @param array array of arguments
     */
    var putArgumentInContext = function (val, index, array) {

        //valida o comando
        if (typeof(val) == "undefined") {
            console.log("Error! You must fill options! Try:\n");
            setUsage();
        }
        else if(val.toString() != "-file" && val.toString() != "-leagues" && val.toString() != "-generate" && val.toString() != "-output" && val.toString() != "-usage"){
            console.log("Error! Command line not exists! Try:\n");
            setUsage();
        }
        else{
            console.log("Put Argument: "+val);
            populateContext[val](array,index);
        }

    };


    /*
     * Getters
     */
    function getFile(){ return file; }
    function getOutput(){ return output; }
    function getLeagues(){ return leagues; }
    function getUsage() { return usage; }
    function getGenerate() { return generate; }
    function getData(prop){ return data[prop]; }

    /**
     * adds data to context
     * @param prop data id
     * @param value data value
     */
    function addData(prop,value){
        data[prop] = value;
    }

    //publish public methods
    return{
        putArgumentInContext: putArgumentInContext,
        getFile: getFile,
        getOutput: getOutput,
        getLeagues: getLeagues,
        getUsage: getUsage,
        getGenerate: getGenerate,
        getData: getData,
        addData: addData
    };

}

module.exports = {
    Context: Context
};
