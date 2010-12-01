"use import";

import ...device;
from util.browser import $;
import ...InputEvent;

exports = Class(function(supr) {
	
	this.init = function(targetCanvas) {
		
		// env browser canvas has a getElement function
		var el = this._el = targetCanvas.getElement();
		el.ondragstart = function() { return false; }
		el.onselectstart = function() { return false; }
		
		this._evtQueue = [];
		
		$.onEvent(el, 'mouseover', this, 'onMouseOver');
		$.onEvent(el, 'mouseout', this, 'onMouseOut');
		
		$.onEvent(el, device.events.start, this, 'handleMouse', 'input:start');
		$.onEvent(document, device.events.move, this, 'handleMouse', 'input:move');
		$.onEvent(document, device.events.end, this, 'handleMouse', 'input:select');
		$.onEvent(window, 'DOMMouseScroll', this, 'handleMouse', 'input:scroll'); // FF
		$.onEvent(window, 'mousewheel', this, 'handleMouse', 'input:scroll'); // webkit
		
		$.onEvent(el, 'touchstart', bind(this, 'touchstart'));
		$.onEvent(el, 'touchend', bind(this, 'touchend'));
		$.onEvent(el, 'touchmove', bind(this, 'touchmove'));
		$.onEvent(el, 'touchcancel', bind(this, 'touchcancel'));
	}
	
	this.onMouseOver = function() { this._isOver = true; }
	this.onMouseOut = function() { this._isOver = false; }
	
	this.getEvents = function() {
		return this._evtQueue.splice(0, this._evtQueue.length);
	}
	
	this.handleMouse = function(type, evt) {
		if (evt.touches) { evt = evt.touches[0] }
		
		var pt;
		if (this._el && evt.target != this._el) { return; }
		if ('offsetX' in evt) {
			pt = {
				x: evt.offsetX,
				y: evt.offsetY
			}
		} else {
			var offsetX = this._el.offsetTop,
				offsetY = this._el.offsetLeft,
			pt = {
				x: evt.pageX - offsetX,
				y: evt.pageY - offsetY
			};
		}
		
		
		switch(type) {
			case 'input:scroll':
				var delta = 0;
				if (evt.wheelDelta) { // IE/Opera/WebKit
					delta = evt.wheelDelta / 120;
					if (window.opera) { delta = -delta; }
				} else if (evt.detail) { // FF
					delta = -evt.detail;
				}
				
				if (delta) {
					var inputEvent = new InputEvent(type, pt);
					inputEvent.scrollDelta = delta;
					inputEvent.scrollAxis = 'axis' in evt ? evt.axis == evt.VERTICAL_AXIS : true;
					this._evtQueue.push(inputEvent);
				}
				
				if (this._isOver) {
					$.stopEvent(evt);
					evt.returnValue = false;
				}
				break;
			default:
				this._evtQueue.push(new InputEvent(type, pt));
				break;
		}
	}
	
	this.touchstart = function() {}
	this.touchend = function() {}
	this.touchmove = function() {}
	this.touchcancel = function() {}
});