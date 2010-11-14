var MAX_TICK = 10000; // ticks over 10 seconds will be considered too large to process

exports.reset = function() { this._last = null; }
exports.tick = function() {
	var now = +new Date;
	var ok = false;
	try {
		var dt = now - (exports._last || now);
		
		if (dt > MAX_TICK) {
			exports.onLargeTick(dt, MAX_TICK);
			dt = 1;
		}
		
		exports._last = now;
		exports.onTick(dt);
		ok = true;
	} 
	finally {
		if (exports.debug && !ok) {
			app.stopLoop()
		}
	}
}

/**
 * If our computer falls asleep, dt might be an insanely large number. 
 * If we're running a simulation of sorts, we don't want the computer
 * to freeze while computing 1000s of simulation steps, so just drop
 * this tick.  Anyone who is interested can listen for a call to 'onLargeTick'
 */
exports.onLargeTick = function(largeDt, threshold) {
	logger.warn('Dropping large tick: ' + largeDt + '; Threshold is set at: ' + threshold);
}

exports.onTick = function(dt) {}

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