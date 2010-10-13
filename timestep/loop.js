var loopSingleton = null
exports.getLoop = function() {
	if (!loopSingleton) {
		// TODO: detect ios somehow;
		if (isIos = false) {
			jsio('import .loop.ios as loopImpl');
		} else {
			jsio('import .loop.html as loopImpl');
		}
		loopSingleton = new loopImpl();
	}
	return loopSingleton;
}