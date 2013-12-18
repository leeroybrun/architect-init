var fs = require('fs');

exports.canCreateFile = function(filename, force, callback) {
	fs.exists(filename, function (exists) {
		// Create file only if it doesn't exists or if "force" option to "yes"
		if((exists && force) || !exists) {
			callback(true);
		} else {
			callback(false);
		}
	});
};

exports.promptToContinue = function(message, error, prompt, callback) {
	console.error(message.red);
	if(error) { console.error(error); }

	var property = {
		name: 'yesno',
		message: 'Do you want to continue (yes|no) ? [yes]',
		validator: /y[es]*|n[o]?/,
		warning: 'Must respond yes or no',
		default: 'yes'
	};

	prompt.get(property, function (err, result) {
		if(result.yesno == 'no') {
			callback(message);
		} else {
			callback();
		}
	});
};