jsio('import .device');

var evtQueue = [];

if (device.isTeaLeafIOS) {
	NATIVE.events.setResponder(evtQueue);
} else {
	jsio('import .input.html as inputImpl');
	new inputImpl(evtQueue);
}

exports.getEvents = function() {
	return evtQueue.splice(0, evtQueue.length);
}
