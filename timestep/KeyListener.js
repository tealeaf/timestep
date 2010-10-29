jsio('import .device');
if (device.isTeaLeafIOS) {
	exports = function() {
		this.setEnabled = function() {}
	};
	return;
}

jsio('from util.browser import $');
jsio('import lib.Enum');

var listenerSingleton = null,
	cancelKeys = lib.Enum(32, 38, 40, 37, 39);

exports = Class(function() {
	this.init = function(el, events) {
		if (listenerSingleton) { return listenerSingleton; }
		listenerSingleton = this;
		
		this._el = el = el || document;
		this._keys = [];
		this._isEnabled = true;

		$.onEvent(el, 'keydown', this, 'onKeyDown');
		//$.onEvent(el, 'click', this, 'click');
		$.onEvent(el, 'keypress', this, 'onKeyPress');
		$.onEvent(el, 'keyup', this, 'onKeyUp');
		$.onEvent(el, 'blur', this, 'clear');
	}
	
	this.setEnabled = function(isEnabled) { this._isEnabled = isEnabled; }

	this.clear = function() {
		for (var i = 0, k; k = this._keys[i]; ++i) {
			if (k.lifted) {
				this._keys.splice(i, 1);
				return;
			} else {
				k.first = false;
			}
		}
	}

	this.onKeyUp = function(e) {
		for (var i = 0, k; k = this._keys[i]; ++i) {
			if (k.code == e.keyCode) {
				k.lifted = true;
			}
		}
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
		for (var i = 0, k; k = this._keys[i]; ++i) {
			if (k.code == e.keyCode) {
				return;
			}
		}
		this._keys.push({code: e.keyCode, first: true});
		$.stopEvent(e);
	}
	
	this.getEvents = function() { return this._keys; }
});
