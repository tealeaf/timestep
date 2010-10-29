"use import";

import ...InputEvent;
import math2D.Point;

var evtQueue = [];
exports.init = function() {
	NATIVE.events.setResponder(evtQueue);
}

exports.getEvents = function() {
	var n = evtQueue.length,
		evts = evtQueue.splice(0, n),
		result = new Array(n);
	for(var i = 0, e; e = evts[i]; ++i) {
		logger.log(e.type);
		result[i] = new InputEvent(e.type, new math2D.Point(e.pt.x, e.pt.y));
	}
	return result;
}
