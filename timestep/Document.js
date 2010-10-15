"use import";

import lib.Enum as Enum;
from util.browser import $;

import .device;
import .canvas;

var container = null;

var SCALING = exports.SCALING = Enum('FIXED', 'RESIZE');

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

	this.setScalingMode(SCALING.FIXED);
}

exports.setScalingMode = function(scalingMode) {
	this.scalingMode = scalingMode;
	this.onResize();
}

exports.resetStyle = function() {
	
}
	
exports.onResize = function() {
	if (!container) { return; }
	
	var w = (document.documentElement || document).clientWidth,
		h = (document.documentElement || document).clientHeight;
	
	if (this.scalingMode == SCALING.FIXED) {
		container.style.marginTop = Math.max(0, h - device.height - 10) / 2 + 'px';
	} else {
		device.width = w;
		device.height = h;
		
		container.style.width = w + 'px';
		container.style.height = h + 'px';
		
		var c = canvas.getCanvas();
		c.el.width = w;
		c.el.height = h;
	}
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