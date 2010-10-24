jsio('import .device');

var evtQueue = [],
	input;

exports.init = function() {
	if (device.isTeaLeafIOS) {
		NATIVE.events.setResponder(evtQueue);
	} else if (!input) {
		jsio('import .input.html as inputImpl');
		input = new inputImpl(evtQueue);
	}
}

exports.getEvents = function() {
	return evtQueue.splice(0, evtQueue.length);
}
