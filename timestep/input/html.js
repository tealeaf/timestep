"use import";

import lib.PubSub as PubSub;
import ..device;
from util.browser import $;
import ..Document;
import ..InputEvent;

var GLOBAL_MOUSE_DOWN = false;

exports = Class(PubSub, function(supr) {
	
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
		$.onEvent(window, 'DOMMouseScroll', bind(this, 'handleMouse', 'input:scroll'));
		
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
				if (evt.wheelDelta) { /* IE/Opera. */
					delta = evt.wheelDelta / 120;
					if (window.opera) { delta = -delta; }
				} else if (evt.detail) { /** Mozilla case. */
					delta = -evt.detail;
				}
				
				if (delta) {
					var evt = new InputEvent(type, pt);
					evt.scrollDelta = delta;
					this._evtQueue.push(evt);
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