// TODO: We need

exports = Class(function() {
	this.init = function() {
		this._tickFunction = function() {}
		window.__loop = this;
		this._running = false;
	}
	
	this.isRunning = function() {
		// TODO: The opengl render function should abort if the value of
		//       window.__loop.isRunning() is false (don't render one extra frame
		//			 after the call to stopLoop, which is asynchronous)
		return this._running;
	}
	
	this.setTickFunction = function(tickFunction) {
		if (tickFunction) {
			this._tickFunction = tickFunction;
		}
	}
	
	this.start = function() {
			// TODO: this should start the obj c timer and call window.__loop.tick()
			//			 each iteration;
		if (!this._running) {
			this._running = true;
			window.location = 'timestep://startLoop';
		}
	}
	
	this.stop = function() {
		if (this._running) {
			// TODO: this should stop the objc timer.
			this._running = false;
			window.location = 'timestep://stopLoop';
		}
	}
	
	this.tick = function() {
		this._tickFunction();
	}	
	
}