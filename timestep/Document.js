jsio('import .device');
jsio('from util.browser import $');

var container = null;

// bgColor == webpage background
// appColor == <canvas> background
exports.init = function(bgColor, appColor) {
	if (GLOBAL.document) {
		document.documentElement.style.cssText = 
			document.body.style.cssText = 'margin:0px;padding:0px;background:' + bgColor;
		container = document.body.appendChild(document.createElement('div'));
	
		container.style.cssText = 'position: relative; margin: 0px auto; width: ' + device.width + 'px; height: ' + device.height + 'px; overflow: hidden; background: ' + appColor;
	
		$.onEvent(window, 'resize', this, 'onResize');
		this.onResize();
	}
}
	
this.onResize = function() {
	container.style.marginTop = Math.max(0, (document.documentElement || document).clientHeight - device.height - 10) / 2 + 'px';
}

exports.getContainer = function() { return container || document && document.body || null; }
exports.appendChild = function(el) { exports.getContainer().appendChild(el); }

exports.getOffset = function() {
	var container = exports.getContainer();
	return !container
		? false
		: {
			x: container.offsetLeft,
			y: container.offsetTop
		};
}