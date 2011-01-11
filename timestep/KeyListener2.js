jsio('import .device');
jsio('import lib.PubSub');
if (device.isTeaLeafIOS) {
	exports = function() {
		this.setEnabled = function() {}
	};
	return;
}

jsio('import std.js as JS');
jsio('from util.browser import $');
jsio('import lib.Enum');
jsio('import .Timer');

var gListenerSingleton = null;


exports = Class(function() {
	this.init = function(el, events) {
		if (gListenerSingleton) { return gListenerSingleton; }
		gListenerSingleton = this;
		
		this._el = el = el || document;
		this._events = [];
		this._shortcuts = [];
		this._isEnabled = true;
		this._keyMap = {};
		
		$.onEvent(el, 'keydown', this, 'onKeyDown');
		$.onEvent(el, 'keypress', this, 'onKeyPress');
		$.onEvent(el, 'keyup', this, 'onKeyUp');
		$.onEvent(el, 'blur', this, 'clear');
	}
	
	this.setEnabled = function(isEnabled) { this._isEnabled = isEnabled; }

	this.clear = function() {
		this._events = [];
	}
	
	this.captureShortcut = function(shortcut) {
		this._shortcuts.push(shortcut);
	}
	
	this.getPressed = function() { return this._keyMap; }

	this.onKeyDown = function(e) {
		
		if (!this._isEnabled) { return; }
		
		var event = {
			code: e.keyCode,
			ctrl: e.ctrlKey,
			shift: e.shiftKey,
			alt: e.altKey,
			meta: e.metaKey, // for mac keyboards
			lifted: false,
			dt: Timer.getTickProgress()
		};
		
		if (event.ctrl || event.shift || event.alt || event.meta) {
			var captured = false;
			for (var i = 0, s; s = this._shortcuts[i]; ++i) {
				if (s.compare(event)) {
					s.publish('Down', event);
					captured = true;
				}
			}
			
			if (captured) { $.stopEvent(e); }
			return;
		} else {
			// MUST cancel event if we're enabled to prevent browser
			// default behaviors (e.g. scrolling)
			$.stopEvent(e);
		}
		
		// We already know that key is down; ignore repeat events.
		if (e.keyCode in this._keyMap) { return; }
		
		this._events.push(event);
		this._keyMap[e.keyCode] = +new Date();
	}
	
	this.onKeyUp = function(e) {
		var progressDt = Timer.getTickProgress();
		var event = {
			code: e.keyCode,
			lifted: true,
			dt: progressDt
		};
		
		delete this._keyMap[e.keyCode];
		this._events.push(event);
		$.stopEvent(e);
	}
	
	this.onKeyPress = function(e) {
		if (!this._isEnabled) { return; }
		if (e.keyCode in gCancelKeys) {
			$.stopEvent(e);
		}
	}
	
	this.peekEvents = function() { return this._events; }
	this.popEvents = function() { return this._events.splice(0, this._events.length); }
});

// TODO: for maximum compatibility, especially with foreign keyboards, this needs to be inferred from the browser.  I think we can rely on a single DOM key event to get the constants in most browsers.
JS.merge(exports, {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	PAUSE: 19,
	BREAK: 19,
	CAPS: 20,
	CAPS_LOCK: 20,
	ESCAPE: 27,
	SPACE: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	PRINT_SCREEN: 44,
	INSERT: 45,
	DELETE: 46,
	META_LEFT: 91,
	WIN_LEFT: 91,
	META_RIGHT: 92,
	WIN_RIGHT: 92,
	SELECT: 93,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	MUTE: 173,
	VOL_DOWN: 174,
	VOL_UP: 175,
	FORWARD: 176,
	BACK: 177,
	STOP: 178,
	PLAY_PAUSE: 179
});

exports.Shortcut = Class(lib.PubSub, function() {
	this.init = function(keyCode, ctrl, shift, alt, meta) {
		this.ctrl = !!ctrl;
		this.shift = !!shift;
		this.alt = !!alt;
		this.meta = !!meta;
		this.code = !!keyCode;
	}
	
	this.compare = function(shortcut) {
		return this.ctrl == shortcut.ctrl 
			&& this.alt == shortcut.alt
			&& this.meta == shortcut.meta
			&& this.shift == shortcut.shift
			&& this.code == shortcut.code;
	}
});

gCancelKeys = lib.Enum(exports.SPACE, exports.LEFT, exports.RIGHT, exports.UP, exports.DOWN);
