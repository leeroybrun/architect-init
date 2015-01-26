var pkg  	= require('../package.json');
var utils  	= require('./utils');
var Plugin	= require('./Plugin');

module.exports = function(pluginOrigName) {
	var plugin = new Plugin('./', pluginOrigName);

	plugin.generate({ force: false }, function(err) {
		
	});
};