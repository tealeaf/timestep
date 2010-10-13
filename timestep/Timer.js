exports.reset = function() { this._last = null; }
exports.tick = function() {
	var now = +new Date;
	exports.onTick(-(exports._last || now) + (exports._last = now));
}
exports.onTick = function() {}

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
