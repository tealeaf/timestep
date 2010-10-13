jsio('from util.browser import $');




var listener = null;

exports = Class(function() {
	this.init = function() {
		if (!listener) {
			listener = new Listener();
		}
	}
	this.getKeys = function() {
		return listener.getKeys();
	}
});


var Listener = Class(function() {
	this.init = function(el, events) {
		this._el = el = el || document;
		this._keys = {};

		$.onEvent(el, 'keydown', this, 'onKeyDown');
		//$.onEvent(el, 'click', this, 'click');
		$.onEvent(el, 'keyup', this, 'onKeyUp');
		$.onEvent(el, 'blur', this, 'clear');
	}


	this.onKeyUp = function(e) {
		this._keys[e.keyCode] = false;
		delete this._keys[e.keyCode];
		$.stopEvent(e);
	}
	
	this.onKeyDown = function(e) {
		this._keys[e.keyCode] = true;
		$.stopEvent(e);
	}
	this.getKeys = function() {
		return this._keys;
	}
});


