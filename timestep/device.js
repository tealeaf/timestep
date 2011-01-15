if (typeof navigator == 'undefined' || !navigator.userAgent) {
	logger.warn('> Timestep was unable to determine your device! Please check that navigator.userAgent is defined.');
	return (exports = {isUnknown: true});
}

var ua = navigator.userAgent;


exports.get = function(module) {
	var DYN_IMPORT_TIMESTEP_ENV = 'import .env.' + exports.name + '.' + module;
	return jsio(DYN_IMPORT_TIMESTEP_ENV, {dontExport: true});
}

exports.isTeaLeafIOS = /TeaLeaf/.test(ua) && /iPhone OS/.test(ua);
if (exports.isTeaLeafIOS) {
	exports.name = 'tealeaf';
	exports.width = navigator.width;
	exports.height = navigator.height;
	
	Image = Class(function() {
		jsio('import std.uri');
		
		this.init = function() {
			this._src = "";
			this.__defineSetter__('src', function(value) {
				if (!value) {
					logger.error('empty src set on an image!');
					this.onerror();
					return;
				}
				
				value = String(std.uri.relativeTo(value, jsio.__env.getCwd()));

				this._src = value;

				logger.log(value);
				var dim = NATIVE.gl.loadImage(value);
				this.width = this.originalWidth = dim.width;
				this.height = this.originalHeight = dim.height;
				
				this.onload();
			});

			this.__defineGetter__('src', function() { return this._src; });
		}

		this.onload = this.onerror = function() {}
	});
	
	
	for (var familyName in NATIVE.gl.fonts) {

		var fonts = NATIVE.gl.fonts[familyName];
		var fontMap = NATIVE.gl.fonts[familyName] = {};

		for (var i = 0, font; font = fonts[i]; ++i) {
			if (/(bolditalic|boldoblique)/i.test(font)){
				fontMap.bolditalic = fontMap.bold = fontMap.italic = font;
				fonts.splice(i--,1);
			}else if(/oblique/i.test(font)){
				fontMap.italic = font;
				fonts.splice(i--,1);
			}
		}
		for (var i = 0, font; font = fonts[i]; ++i) {
			if (/bold/i.test(font)){
				fontMap.bold = font;
				fonts.splice(i--,1);
			} else if (/italic/i.test(font)) {
				fontMap.italic = font;
				fonts.splice(i--,1);
			}
		}

		for (var i=0,font; font=fonts[i]; ++i) {
			if(/light/i.test(font)){
				for (var j=0,font; font=fonts[j]; ++j) {
					if(/medium/i.test(font)){
						fontMap.bold = font;
					}
				}
			}
		}
	}

	logger.log(JSON.stringify(NATIVE.gl.fonts));
	
	
} else {
	exports.isSafari = /Safari/.test(ua);
	if (/(iPod|iPhone|iPad)/i.test(ua)) {
		exports.isIOS = true;
		exports.isUIWebView = !exports.isSafari;
		exports.height = 320; window.innerHeight;
		exports.width = 240; window.innerWidth;
		exports.clickEventName = 'touchstart';
		exports.name = 'browser';
		exports.events = {
			start: 'touchstart',
			move: 'touchmove',
			end: 'touchend'
		};
	} else if (/Mobile Safari/.test(ua)) {
		exports.isAndroid = true;
		exports.height = window.screen.height;
		exports.width = window.screen.width;
		exports.clickEventName = 'touchstart';	
		exports.height = 320;
		exports.width = 533;
		exports.events = {
			start: 'touchstart',
			move: 'touchmove',
			end: 'touchend'
		};
	} else {
		// All other browsers
		exports.height = 600;
		exports.width = 800;
		exports.events = {
			start: 'mousedown',
			move: 'mousemove',
			end: 'mouseup'
		};
		
		exports.name = 'browser';
	}
}
	

exports.getDimensions = function(isLandscape) {
	var dMin = Math.min(exports.width, exports.height),
		dMax = Math.max(exports.width, exports.height);
	
	return isLandscape
		? {height: dMin, width: dMax}
		: {height: dMax, width: dMin};
}
