#!/usr/bin/env node

var os  	= require('os');
var fs   	= require('fs');
var path 	= require('path');
var async  	= require('async');
var cli  	= require('commander');
var mkdirp  = require('mkdirp');
var pkg  	= require('../package.json');
var utils  	= require('./utils');

cli
    .version(pkg.version)
    .option('-c, --config <configfile>', 'Specify path to plugins config file', 'plugins.conf')
    .option('-d, --dir <pluginsdir>', 'Directory where plugins will be stored', 'lib')
    .option('-s, --structure [auto|sub|dotted]', 'Do you want [auto], [sub] or [dotted] dirs for plugins ?', 'auto')
    .option('-p, --pkg [yes|no]', 'Create package.json files for each plugins', 'yes')
    .option('-m, --main [yes|no]', 'Create main file for each plugins', 'yes')
    .option('-f, --force', 'Force the creation of directories/files, even if they exists')
    .parse(process.argv);

// Basic verification of options. If not second option, we apply default.
if (cli.structure != 'dotted' && cli.structure != 'sub') {
    cli.structure = 'auto';
}

if (cli.package != 'no') {
    cli.package = 'yes';
}

if (cli.main != 'no') {
    cli.main = 'yes';
}

// Print options
console.log('Welcome !');
console.log('You asked to create plugins defined in "'+ cli.config +'" in the directory "'+ cli.dir +'" with a '+ cli.structure +' directory structure.');
console.log('We will '+ ((cli.pkg == 'no') ? 'not ' : '')  +'create the package.json files for each plugins.');
console.log('We will '+ ((cli.main == 'no') ? 'not ' : '')  +'create the main files for each plugins.');
console.log('If a package.json/main file already exists for a plugin, we will '+ ((!cli.force) ? 'not ' : '') +'replace it.');
console.log('Starting to scaffold your architect app...');

// Try to read config file
fs.readFile(cli.config, 'utf8', function (err, data) {
	if (err) {
		console.log('Cannot read config file "'+cli.config+'".');
    	process.exit(1);
	}

	var plugins = data.split(os.EOL);

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