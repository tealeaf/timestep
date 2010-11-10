exports.reset = function() { this._last = null; }
exports.tick = function() {
	var now = +new Date;
	var ok = false;
	try {
		exports.onTick(-(exports._last || now) + (exports._last = now));
		ok = true;
	} 	
	finally {
		if (exports.debug && !ok) {
			app.stopLoop()
		}
	}
}
exports.onTick = function() {}

exports.debug = false;

jsio('import .device');
 
// TODO: <jsio>('from iOS import start as exports.start, stop as exports.stop');

exports.start = function(minDt) {
	this.reset();
	this.isRunning = true;
	device.get('Timer').start(exports.tick, minDt);
}

exports.stop = function() {
	this.reset();
	this.isRunning = false;
	device.get('Timer').stop();
}

exports.getTickProgress = function() {
	var now = +new Date;
	return (-(exports._last || now) + now);
}