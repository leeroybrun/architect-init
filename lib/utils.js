exports.canCreateFile = function(filename, force, callback) {
	fs.exists(filename, function (exists) {
		// Create file only if it doesn't exists or if "force" option to "yes"
		if((exists && force) || !exists) {
			callback(true);
		} else {
			callback(false);
		}
	});
}