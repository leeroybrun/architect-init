var os  	= require('os');
var fs   	= require('fs');
var path 	= require('path');
var async  	= require('async');
var prompt  = require('prompt');
var colors  = require('colors');

var pkg  	= require('../package.json');
var utils  	= require('./utils');
var Plugin	= require('./Plugin');

module.exports = function() {
	prompt.start();

	var schema = {
	    properties: {
	        config: {
	            description: 'Where is stored your plugins list file ?',
	            default: 'plugins.conf',
	            required: true
	        },
	        dir: {
	            description: 'Where do you want to store the plugins ?',
	            default: 'lib/',
	            required: true
	        },
	        structure: {
	            message: 'Do you want sub or dotted dirs for plugins ?',
	            validator: /auto|sub|dotted/,
	            warning: 'Must respond "auto", "sub" or "dotted"',
	            default: 'auto',
	            required: true
	        },
	        pkg: {
	            message: 'Create package.json file for each plugins (yes|no) ?',
	            validator: /y[es]*|n[o]?/,
	            warning: 'Must respond yes or no',
	            default: 'yes',
	            required: true
	        },
	        main: {
	            message: 'Create main file for each plugins (yes|no) ?',
	            validator: /y[es]*|n[o]?/,
	            warning: 'Must respond yes or no',
	            default: 'yes',
	            required: true
	        },
	        force: {
	            message: 'Force the creation of files even if they exists (yes|no) ?',
	            validator: /y[es]*|n[o]?/,
	            warning: 'Must respond yes or no',
	            default: 'no',
	            required: true
	        }
	    }
	};

	prompt.get(schema, function (err, prompted) {
	    // Convert yes/no to true/false
	    prompted.pkg   = (prompted.pkg == 'yes' || prompted.pkg == 'y') ? true : false;
	    prompted.main  = (prompted.main == 'yes' || prompted.main == 'y') ? true : false;
	    prompted.force = (prompted.force == 'yes' || prompted.force == 'y') ? true : false;

	    // Print options
	    console.log(os.EOL +'----------------------------------------------------------------');
	    console.log('You asked to create plugins defined in "'+ prompted.config.green +'" in the directory "'+ prompted.dir.green +'" with a'+ (prompted.structure == 'auto' ? 'n ' : ' ') + prompted.structure.green +' directory structure.');
	    console.log('We will '+ ((!prompted.pkg) ? 'not ' : '').red  +'create the package.json file for each plugins.');
	    console.log('We will '+ ((!prompted.main) ? 'not ' : '').red  +'create the main file for each plugins.');
	    console.log('If a package.json/main file already exists for a plugin, we will '+ ((!prompted.force) ? 'not ' : '').red +'replace it.');
	    console.log('Starting to scaffold your architect app...'.green);
	    console.log('----------------------------------------------------------------'+ os.EOL);

	    var plugins;
	    // Read config file
	    try {
	        plugins = fs.readFileSync(prompted.config, 'utf8').toString().split('\n');
	    } catch(e) {
	        console.log('Cannot read config file "'+prompted.config+'".'.red);
	        process.exit(1);
	    }

	    // If structure is forced to subdirs, we need to replace dots and normalize with platform-specific file separator
	    if(prompted.structure == 'sub') {
	        for(var i = 0; i < plugins.length; i++) {
	            plugins[i] = path.normalize(utils.replaceAll(plugins[i], '.', path.sep));
	        }
	    }

	    // Structure forced to dotted dirs, remove all platform-specific file separator
	    if(prompted.structure == 'dotted') {
	        for(var i = 0; i < plugins.length; i++) {
	            plugins[i] = utils.replaceAll(plugins[i], ['\\', '/'], '.');
	        }
	    }

	    // Create plugins dirs and files (if requested)
	    async.eachSeries(plugins, function(pluginOrigName, callback) {
	        var plugin = new Plugin(prompted.dir, pluginOrigName);

	        plugin.generate({ force: prompted.force }, callback);
	    }, function(err) {
	        console.log('');
	        if(err) {
	            console.log('An error occured... please review informations below and restart architect-init when ready.'.red);
	        } else {
	            console.log('Congrats ! Your architect app is now ready, find all your plugins in "'+ prompted.dir.green +'" and start coding !');
	        }
	    });
	});
};