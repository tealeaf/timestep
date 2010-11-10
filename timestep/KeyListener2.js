jsio('import .device');
if (device.isTeaLeafIOS) {
	exports = function() {
		this.setEnabled = function() {}
	};
	return;
}

jsio('from util.browser import $');
jsio('import lib.Enum');
jsio('import .Timer');

var listenerSingleton = null,
	cancelKeys = lib.Enum(32, 38, 40, 37, 39);

exports = Class(function() {
	this.init = function(el, events) {
		if (listenerSingleton) { return listenerSingleton; }
		listenerSingleton = this;
		
		this._el = el = el || document;
		this._events = [];
		this._isEnabled = true;
		this.keyMap = {}
		$.onEvent(el, 'keydown', this, 'onKeyDown');
		//$.onEvent(el, 'click', this, 'click');
		$.onEvent(el, 'keypress', this, 'onKeyPress');
		$.onEvent(el, 'keyup', this, 'onKeyUp');
		$.onEvent(el, 'blur', this, 'clear');
	}
	
	this.setEnabled = function(isEnabled) { this._isEnabled = isEnabled; }

	this.clear = function() {
		this._events = [];
	}

	this.onKeyUp = function(e) {
		var progressDt = Timer.getTickProgress();
		var event = { code: e.keyCode, lifted: true, dt: progressDt }
		logger.debug('keyUp', event);
		for (var code in this.keyMap) {
			if (code == event.code) {
				delete this.keyMap[code];
				break;
			}
		}
		this._events.push(event);
		$.stopEvent(e);
	}
	
	this.onKeyPress = function(e) {
		if (!this._isEnabled) { return; }
		if (e.keyCode in cancelKeys) {
			$.stopEvent(e);
		}
	}
	
	this.onKeyDown = function(e) {
		if (!this._isEnabled) { return; }
		// We already know that key is down; ignore repeat events.
		if (this.keyMap[e.keyCode]) { return; }
		var event = { code: e.keyCode, lifted: false, dt: Timer.getTickProgress() }
		logger.debug("keyDown", event);
		this._events.push(event);
		this.keyMap[e.keyCode] = true;
		$.stopEvent(e);
	}
	
	this.peekEvents = function() { return this._events; }
	this.popEvents = function() { return this._events.splice(0, this._events.length); }
});
