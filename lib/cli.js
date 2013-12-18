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
			plugins[i] = path.normalize(plugins[i].replace('.', path.sep));
		}
	}

	// Structure forced to dotted dirs, remove all platform-specific file separator
	if(prompted.structure == 'dotted') {
		for(var i = 0; i < plugins.length; i++) {
			plugins[i] = plugins[i].replace(path.sep, '.').replace('/', '.');
		}
	}

	// Need to create package.json files ? Load template.
	if(prompted.pkg) {
		var pkgFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'package.json')).toString();
	}

	// Need to create main plugins files ? Load template.
	if(prompted.main) {
		var mainFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'main.js')).toString();
	}

	// Create plugins dirs and files (if requested)
	async.eachSeries(plugins, function(plugin, callback) {
		var pluginName = plugin.replace(path.sep, '.').replace('/', '.');
		var pluginDir  = path.join(prompted.dir, plugin);

		console.log('Creating plugin "'+ pluginName +'" in "'+ pluginDir +'"...');

		async.waterfall([
			function createPluginDir(cb) {
				mkdirp(pluginDir, function(err) {
					if(err) {
						console.log('Cannot create plugin directory "'+ pluginDir +'".');
						console.log(err);

						cb(new Error());
					} else {
						cb();
					}
				});
			},

			function createPackageJson(cb) {
				if(prompted.pkg) {
					var pluginPkgFilename = path.join(pluginDir, 'package.json');

					utils.canCreateFile(pluginPkgFilename, prompted.force, function(yesWeCan) {
						if(!yesWeCan) {
							console.log('Package.json already exists for plugin "'+ plugin +'". Please restart architect-init and set force replace to "yes".');
							cb(new Error());
						}

						var pluginPkg = pkgFile.replace(new RegExp('--pluginName--', 'g'), pluginName);

						fs.writeFile(pluginPkgFilename, pluginPkg, function (err) {
							if(err) {
								console.log('Cannot create plugin package.json "'+ pluginPkgFilename +'".');
								console.error(err);

								cb(new Error());
							} else {
								cb();
							}
						});
					});
				} else {
					cb();
				}
			},

			function createMainFile(cb) {
				// Asked to create main plugin file ?
				if(prompted.main) {
					var pluginMainFilename = path.join(pluginDir, pluginName+'.js');

					utils.canCreateFile(pluginMainFilename, prompted.force, function (yesWeCan) {
						if(!yesWeCan) {
							console.log('Main file already exists for plugin "'+ plugin +'". Please restart architect-init and set force replace to "yes".');
							cb(new Error());
						}

						var pluginMainFile = mainFile.replace(new RegExp('--pluginName--', 'g'), pluginName);

						fs.writeFile(pluginMainFilename, pluginMainFile, function (err) {
							if(err) {
								console.log('Cannot create plugin main file "'+ pluginMainFilename +'".');
								console.error(err);

								cb(new Error());
							} else {
								cb();
							}
						});
					});
				} else {
					cb();
				}
			}
		], function(err) {
			callback(err);
		});
	}, function(err) {
		console.log('');
		if(err) {
			console.log('An error occured... please review informations below and restart architect-init when ready.'.red);
		} else {
			console.log('Congrats ! Your architect app is now ready, find all your plugins in "'+ prompted.dir.green +'" and start coding !');
		}
	});
});