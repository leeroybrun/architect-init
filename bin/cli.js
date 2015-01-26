#!/usr/bin/env node

var program = require('commander');
var pkg  	= require('../package.json');

var cmd;

// Generate new project
cmd = program.command('new');
cmd.description('Generate a new project');
cmd.action(require('./newProject'));

// Generate new plugin folder
cmd = program.command('generate <name>');
cmd.description('Generate a new plugin');
cmd.action(require('./generatePlugin'));

program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
	program.help();
}
