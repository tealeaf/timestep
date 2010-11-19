var canvasSingleton = null;

exports.getCanvas = function(opts) {
	if (!canvasSingleton) {
		canvasSingleton = new canvasImpl(opts);
	}
	return canvasSingleton;
}

exports.newCanvas = function(opts) {
	return new canvasImpl(opts);
}

function getter(name) {
	return (function() {
		return this._ctx[name];
	});
}

function setter(name) {
	return (function(val) {
		this._ctxShim[name] = val;
		this._buffer.push(['set', [name, val]]);//'set', name, val);
	});
}

function wrap(name) {
	return (function() {
		this._buffer.push([name, arguments]);
	})
}

exports.BufferedCanvas = Class(function() {
	
	this.init = function(opts) {
		this._opts = opts = opts || {}
		opts.width = opts.width || 480;
		opts.height = opts.height || 320;
		this._buffer = [];
		this._ctxShim = {};
	}
	
	this.swap = function() {
		var ops = this._buffer;
		this._buffer = [];
		this.execSwap(ops);
	}
	
	this.reset = function() {
		this._buffer = [];
	}
	
	this.show = this.hide = function() { throw 'abstract'; }

	this.drawImage = wrap('drawImage');
	this.putImageData = wrap('putImageData');
	
	this.fillRect = wrap('fillRect');
	this.fillCircle = function(x, y, radius, fillStyle) {
		this._buffer.push(['beginPath']);
		this._buffer.push(['arc', [x, y, radius, 0, 2 * Math.PI, true]]);
		this._buffer.push(['fill']);
	}
	
	this.setGlobalAlpha = setter('globalAlpha');
	this.getGlobalAlpha = getter('globalAlpha');
	
	this.setFillStyle = setter('fillStyle');
	this.getFillStyle = getter('fillStyle');

	this.setStrokeStyle = setter('strokeStyle');
	this.getStrokeStyle = getter('strokeStyle');

	this.setLineWidth = setter('lineWidth');
	this.getLineWidth = getter('lineWidth');
	
	this.setShadowOffsetX = setter('shadowOffsetX');
	this.getShadowOffsetX = getter('shadowOffsetX');
	this.setShadowOffsetY = setter('shadowOffsetY');
	this.getShadowOffsetY = getter('shadowOffsetY');
	this.setShadowBlur    = setter('shadowBlur');
	this.getShadowBlur    = getter('shadowBlur');
	this.setShadowColor   = setter('shadowColor');
	this.getShadowColor   = getter('shadowColor');
	
	this.setFont = setter('font');
	this.getFont = getter('font');
	this.setTextAlign = setter('textAlign');
	this.getTextAlign = getter('textAlign');
	this.setTextBaseline = setter('textBaseLine');
	this.getTextBaseline = getter('textBaseLine');
	
	this.fillText = wrap('fillText');
	this.measureText = wrap('measureText');
	this.strokeText = wrap('strokeText');
	this.beginPath = wrap('beginPath');
	this.moveTo = wrap('moveTo');
	this.closePath = wrap('closePath');
	this.lineTo = wrap('lineTo');

	this.arc = wrap('arc');
	this.quadraticCurveTo = wrap('quadraticCurveTo');
	
	this.rect = wrap('rect');
	this.fillRect = wrap('fillRect');
	this.strokeRect = wrap('strokeRect');

	this.save = wrap('save');
	this.restore = wrap('restore');
	
	this.clip = wrap('clip');
	this.stroke = wrap('stroke');
	this.fill = wrap('fill');
	
	this.translate = wrap('translate');
	this.rotate = wrap('rotate');
	this.scale = wrap('scale');

});



jsio('import .device');
if (device.isTeaLeafIOS) {
	jsio('import .canvas.ios as canvasImpl');
} else {
	jsio('import .canvas.html as canvasImpl');
}