"use import";

import ...InputEvent;
import math2D.Point;

exports = Class(function() {
	
	this.init = function(targetCanvas) {
		this._evtQueue = [];
		NATIVE.events.setResponder(this._evtQueue);
	}
	
	this.getEvents = function() {
		var n = this._evtQueue.length,
			evts = this._evtQueue.splice(0, n),
			result = new Array(n);
		
		for(var i = 0, e; e = evts[i]; ++i) {
			result[i] = new InputEvent(e.type, new math2D.Point(e.pt.x, e.pt.y));
		}
		
		return result;
	}
});
