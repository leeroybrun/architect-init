var os  	= require('os');
var fs   	= require('fs');
var path 	= require('path');
var async  	= require('async');
var mkdirp  = require('mkdirp');

var utils  	= require('./utils');

var pkgFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'package.json')).toString();
var mainFile = fs.readFileSync(path.join(__dirname, '..', 'tpl', 'main.js')).toString();

var Plugin = function(dir, name) {
	this.origName = name;

	this.name = utils.replaceAll(this.origName, ['\\', '/'], '.');
	this.dir  = path.join(dir, this.origName);
}

Plugin.prototype.generate = function(options, callback) {
	var plugin = this;

	var options = {
		force: (options.force !== undefined) ? options.force : false,
		pkg: (options.pkg !== undefined) ? options.pkg : true,
		main: (options.main !== undefined) ? options.main : true
	};

	console.log('Creating plugin "'+ plugin.name +'" in "'+ plugin.dir +'"...');

    async.waterfall([
        function createPluginDir(cb) {
            plugin.createDir(cb);
        },

        function createPackageJson(cb) {
            if(options.pkg) {
                plugin.createPkgJson(options.force, cb);
            } else {
                cb();
            }
        },

        function createMainFile(cb) {
            // Asked to create main plugin file ?
            if(options.main) {
                plugin.createMainFile(options.force, cb);
            } else {
                cb();
            }
        }
    ], function(err) {
        callback(err);
    });
};

Plugin.prototype.createDir = function(callback) {
	var plugin = this;

	mkdirp(plugin.dir, function(err) {
        if(err) {
            console.log('Cannot create plugin directory "'+ pluginDir +'".');
            console.log(err);

            callback(new Error());
        } else {
            callback();
        }
    });
};

Plugin.prototype.createPkgJson = function(force, callback) {
	var plugin = this;

	plugin.pkgFilename = path.join(plugin.dir, 'package.json');

    utils.canCreateFile(plugin.pkgFilename, force, function(yesWeCan) {
        if(!yesWeCan) {
            console.log('Package.json already exists for plugin "'+ plugin.origName +'". Please restart architect-init and set force replace to "yes".');
            callback(new Error());
        }

        var pluginPkg = pkgFile.replace(new RegExp('--pluginName--', 'g'), plugin.name);

        fs.writeFile(plugin.pkgFilename, pluginPkg, function (err) {
            if(err) {
                console.log('Cannot create plugin package.json "'+ plugin.pkgFilename +'".');
                console.error(err);

                callback(new Error());
            } else {
                callback();
            }
        });
    });
};

Plugin.prototype.createMainFile = function(force, callback) {
	var plugin = this;

	plugin.mainFilename = path.join(plugin.dir, plugin.name+'.js');

    utils.canCreateFile(plugin.mainFilename, force, function (yesWeCan) {
        if(!yesWeCan) {
            console.log('Main file already exists for plugin "'+ plugin.origName +'". Please restart architect-init and set force replace to "yes".');
            callback(new Error());
        }

        var pluginMainFile = mainFile.replace(new RegExp('--pluginName--', 'g'), plugin.name);

        fs.writeFile(plugin.mainFilename, pluginMainFile, function (err) {
            if(err) {
                console.log('Cannot create plugin main file "'+ plugin.mainFilename +'".');
                console.error(err);

                callback(new Error());
            } else {
                callback();
            }
        });
    });
};

module.exports = Plugin;