#!/usr/bin/env node

var os  	= require('os');
var fs   	= require('fs');
var path 	= require('path');
var async  	= require('async');
var prompt  = require('prompt');
var colors  = require('colors');
var mkdirp  = require('mkdirp');
var pkg  	= require('../package.json');
var utils  	= require('./utils');

prompt.start();

var schema = {
	properties: {
		config: {
			description: 'Where is stored your plugins list file ? [plugins.conf]',
			default: 'plugins.conf',
			required: true
		},
		dir: {
			description: 'Where do you want to store the plugins ? [lib/]',
			default: 'lib/',
			required: true
		},
		structure: {
			description: 'Do you want sub or dotted dirs for plugins ? [auto]',
			validator: /auto|sub|dotted/,
			warning: 'Must respond "auto", "sub" or "dotted"',
			default: 'auto',
			required: true
		},
		pkg: {
			description: 'Create package.json files for each plugins (yes|no) ? [yes]',
			validator: /y[es]*|n[o]?/,
			warning: 'Must respond yes or no',
			default: 'yes',
			required: true
		},
		main: {
			description: 'Create main file for each plugins (yes|no) ? [yes]',
			validator: /y[es]*|n[o]?/,
			warning: 'Must respond yes or no',
			default: 'yes',
			required: true
		},
		force: {
			description: 'Force the creation of directories/files, even if they exists (yes|no) ? [no]',
			validator: /y[es]*|n[o]?/,
			warning: 'Must respond yes or no',
			default: 'no',
			required: true
		}
	}
};

prompt.get(schema, function (err, cli) {
	// Print options
	console.log('Welcome !');
	console.log('You asked to create plugins defined in "'+ cli.config +'" in the directory "'+ cli.dir +'" with a '+ cli.structure +' directory structure.');
	console.log('We will '+ ((cli.pkg == 'no') ? 'not ' : '')  +'create the package.json files for each plugins.');
	console.log('We will '+ ((cli.main == 'no') ? 'not ' : '')  +'create the main files for each plugins.');
	console.log('If a package.json/main file already exists for a plugin, we will '+ ((!cli.force) ? 'not ' : '') +'replace it.');
	console.log('Starting to scaffold your architect app...');

	var plugins;
	// Read config file
	try {
		plugins = fs.readFileSync(cli.config, 'utf8').toString().split(os.EOL);
	} catch(e) {
		console.log('Cannot read config file "'+cli.config+'".'.red);
    	process.exit(1);
	}

	// If structure is forced to subdirs, we need to replace dots and normalize with platform-specific file separator
	if(cli.structure == 'sub') {
		for(var i = 0; i < plugins.length; i++) {
			plugins[i] = path.normalize(plugins[i].replace('.', path.sep));
		}
	}

	// Structure forced to dotted dirs, remove all platform-specific file separator
	if(cli.structure == 'dotted') {
		for(var i = 0; i < plugins.length; i++) {
			plugins[i] = plugins[i].replace(path.sep, '.');
		}
	}

	// Need to create package.json files ? Load template.
	if(cli.pkg == 'yes') {
		var pkgFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'package.json')).toString();
	}

	// Need to create main plugins files ? Load template.
	if(cli.main == 'yes') {
		var mainFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'main.js')).toString();
	}

	
});



// Try to read config file
, function (err, data) {
	if (err) {
		console.log('Cannot read config file "'+cli.config+'".');
    	process.exit(1);
	}

	var plugins = data;

	

	

	// Create plugins dirs and files (if requested)
	async.each(plugins, function(plugin, cb) {
		var pluginName = plugin.replace(path.sep, '.');
		var pluginDir  = path.join(cli.dir, plugin);

		// Use async.waterfall ?

		mkdirp(pluginDir, function(err) {
			if(err) {
				console.log('Cannot create plugin directory "'+ pluginDir +'".');
				console.error(err);
				return cb(err);
			}

			// Asked to create a package.json for plugins ?
			if(cli.pkg == 'yes') {
				var pluginPkgFilename = path.join(pluginDir, 'package.json');

				utils.canCreateFile(pluginPkgFilename, cli.force, function (yesWeCan) {
					if(!yesWeCan) {
						console.log('Package.json already exists for plugin "'+ plugin +'". Try to use --force');
						return;
					}

					var pluginPkg = pkgFile.replace('--pluginName--', pluginName);

					fs.writeFile(pluginPkgFilename, pluginPkg, function (err) {
						if(err) {
							console.log('Cannot create plugin package.json "'+ pluginPkgFilename +'".');
							console.error(err);
						}
					});
				});
			}

			// Asked to create main plugin file ?
			if(cli.main == 'yes') {
				var pluginMainFilename = path.join(pluginDir, pluginName+'.js');

				utils.canCreateFile(pluginMainFilename, cli.force, function (yesWeCan) {
					if(!yesWeCan) {
						console.log('Main file already exists for plugin "'+ plugin +'". Try to use --force');
						return;
					}

					var pluginMainFile = mainFile.replace('--pluginName--', pluginName);

					fs.writeFile(pluginMainFilename, pluginMainFile, function (err) {
						if(err) {
							console.log('Cannot create plugin main file "'+ pluginMainFilename +'".');
							console.error(err);
						}
					});
				});
			}

			cb(null);
		});
	}, function(err) {
		console.log('Congrats ! Your architect app is now ready, find all your plugins in "'+ cli.dir +'" and start coding !')
	});
});