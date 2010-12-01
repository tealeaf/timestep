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
	import .Application;

	if (GLOBAL.document) {
		document.documentElement.style.cssText = 
			document.body.style.cssText = 'height:100%;margin:0px;padding:0px;background:' + bgColor;
		container = document.body.appendChild(document.createElement('div'));
	
		container.style.cssText = 'position: relative; margin: 0px auto; overflow: hidden; background: ' + appColor;
		
		$.onEvent(window, 'resize', this, 'onResize');
	}

	this.setScalingMode(SCALING.FIXED);
}

exports.setScalingMode = function(scalingMode) {
	this.scalingMode = scalingMode;
	
	if (!container) { return; }
	
	var s = container.style;
	switch(scalingMode) {
		case SCALING.FIXED:
			s.width = device.width + 'px';
			s.height = device.height + 'px';
			break;
		case SCALING.RESIZE:
			container.style.width = '100%';
			container.style.height = '100%';
			break;
	}
	this.onResize();
}

var timer = null;
exports.onResize = function() {
	if (!container) { return; }
	
	var dim = $(window);
	if (this.scalingMode == SCALING.FIXED) {
		container.style.marginTop = Math.max(0, dim.height - device.height - 10) / 2 + 'px';
	} else {
		container.style.margin = '0px';
	
		timer = null;
		
		device.width = dim.width;
		device.height = dim.height;

		var c = canvas.getCanvas(),
			el = c.getElement();
		
		el.width = dim.width;
		el.height = dim.height;
		
		var app = Application.get();
		if (app) { app.render(); }
	}
}

exports.getContainer = function() { return container || document && document.body || null; }
exports.appendChild = function(el) {
	if ($) {
		exports.getContainer().appendChild(el);
	}
}

exports.getOffset = function() {
	var container = exports.getContainer();
	return !container
		? false
		: {
			x: container.offsetLeft,
			y: container.offsetTop
		};
}