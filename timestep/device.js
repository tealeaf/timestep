if (typeof navigator == 'undefined' || !navigator.userAgent) {
	logger.warn('> Timestep was unable to determine your device! Please check that navigator.userAgent is defined.');
	return (exports = {isUnknown: true});
}

var ua = navigator.userAgent;


exports.get = function(module) {
	var DYN_IMPORT_TIMESTEP_ENV = 'import .env.' + exports.name + '.' + module;
	return jsio(DYN_IMPORT_TIMESTEP_ENV, {dontExport: true});
}

exports.isTeaLeafIOS;
if ((exports.isTeaLeafIOS = /TeaLeaf/.test(ua) && /iPhone OS/.test(ua))) {
	exports.name = 'tealeaf';
	exports.width = navigator.width;
	exports.height = navigator.height;
} else {
	exports.isSafari = /Safari/.test(ua);
	if (/(iPod|iPhone|iPad)/i.test(ua)) {
		exports.isIOS = true;
		exports.isUIWebView = !exports.isSafari;
		exports.height = window.innerHeight;
		exports.width = window.innerWidth;
		exports.clickEventName = 'touchstart';
		alert('This application may run faster as a native app.');
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
