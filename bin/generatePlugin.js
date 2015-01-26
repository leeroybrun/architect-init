var pkg  	= require('../package.json');
var utils  	= require('../lib/utils');
var Plugin	= require('../lib/Plugin');

module.exports = function(pluginOrigName) {
	var plugin = new Plugin('./', pluginOrigName);

	plugin.generate({ force: false }, function(err) {
		
	});
};