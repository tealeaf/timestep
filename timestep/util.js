exports.mergeDefaults = function(opts, defaults) {
	opts = opts || {};
	for (var key in defaults) {
		if (!opts.hasOwnProperty(key)) {
			opts[key] = defaults[key];
		}
	}
	
	return opts;
}

exports.copyDefaults = function(opts, defaults) {
	var out = {};
	for (var key in opts) {
		out[key] = opts[key];
	}
	
	return exports.mergeDefaults(opts, defaults);
}