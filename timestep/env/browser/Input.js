"use import";

import lib.PubSub as PubSub;
import ...device;
from util.browser import $;
import ...Document;
import ...InputEvent;

var evtQueue = [];

exports.init = function() {
	input = new InputHandler(evtQueue);
}

exports.getEvents = function() {
	return evtQueue.splice(0, evtQueue.length);
}

var GLOBAL_MOUSE_DOWN = false;

var InputHandler = Class(PubSub, function(supr) {
	
	this.init = function(evtQueue) {
		var el = this._el = $({
			style: {
				width: '100%',
				height: '100%',
				position: 'absolute',
				top: 0,
				left: 0,
				padding: 0,
				margin: 0,
				zIndex: 100
			}
		});
		
		el.ondragstart = function() { return false; }
		el.onselectstart = function() { return false; }
		
		this._evtQueue = evtQueue;
		
		$.onEvent(el, device.events.start, bind(this, 'handleMouse', 'input:start'));
		$.onEvent(document, device.events.move, bind(this, 'handleMouse', 'input:move'));
		$.onEvent(document, device.events.end, bind(this, 'handleMouse', 'input:select'));
		$.onEvent(window, 'DOMMouseScroll', bind(this, 'handleMouse', 'input:scroll')); // FF
		$.onEvent(window, 'mousewheel', bind(this, 'handleMouse', 'input:scroll')); // webkit
		
		$.onEvent(el, 'touchstart', bind(this, 'touchstart'));
		$.onEvent(el, 'touchend', bind(this, 'touchend'));
		$.onEvent(el, 'touchmove', bind(this, 'touchmove'));
		$.onEvent(el, 'touchcancel', bind(this, 'touchcancel'));
		
		if (Document.getContainer()) {
			Document.appendChild(el);
		} else {
			var timer = setInterval(bind(this, function() {
				if (Document.getContainer()) {
					clearInterval(timer);
					Document.appendChild(el);
				}
			}), 0);
		}
	}
	
	this.handleMouse = function(type, evt) {
		if (evt.touches) { evt = evt.touches[0] }
		
		var offset = Document.getOffset(),
			pt = {
				x: evt.pageX - offset.x,
				y: evt.pageY - offset.y
			};
		
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
				
				$.stopEvent(evt);
				evt.returnValue = false;
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