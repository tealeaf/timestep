var interval;
exports.start = function(onTick, minDt) {
	if (interval) { clearInterval(interval); }
	interval = setInterval(onTick, minDt || 20);
}

exports.stop = function() {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}
