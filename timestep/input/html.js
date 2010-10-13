jsio('import lib.PubSub as PubSub');
jsio('import ..device');
jsio('from util.browser import $');
jsio('import ..Document');

var GLOBAL_MOUSE_DOWN = false;

exports = Class(PubSub, function(supr) {
	
	this.init = function(evtQueue) {
		var el = this._el = $.create('div');
		$.style(el, {
			width: device.width + 'px',
			height: device.height + 'px',
			position: 'absolute',
			top: 0,
			left: 0,
			padding: 0,
			margin: 0,
			zIndex: 100
		});
		
		el.ondragstart = function() { return false; }
		el.onselectstart = function() { return false; }
		
		this._evtQueue = evtQueue;
		
		$.onEvent(el, device.events.start, bind(this, 'handleMouse', 'start'));
		$.onEvent(document, device.events.move, bind(this, 'handleMouse', 'move'));
		$.onEvent(document, device.events.end, bind(this, 'handleMouse', 'end'));
		$.onEvent(window, 'DOMMouseScroll', bind(this, 'handleMouse', 'wheel'));
		
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
			case 'wheel':
				var delta = 0;
				if (evt.wheelDelta) { /* IE/Opera. */
					delta = evt.wheelDelta / 120;
					if (window.opera) { delta = -delta; }
				} else if (evt.detail) { /** Mozilla case. */
					delta = -evt.detail;
				}
				
				if (delta) {
					this._evtQueue.push({
						type: 'scroll',
						pt: pt,
						delta: delta
					});
				}
				
				$.stopEvent(evt);
				evt.returnValue = false;
				break;
			default:
				this._evtQueue.push({
					type: type,
					pt: pt
				});
				break;
		}
	}
	
	this.touchstart = function() {}
	this.touchend = function() {}
	this.touchmove = function() {}
	this.touchcancel = function() {}
});