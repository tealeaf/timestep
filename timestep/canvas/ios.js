jsio('from ..canvas import BufferedCanvas');
jsio('import ..device');
jsio('import std.uri');
jsio('import ..RGBA');
jsio('import ..Font');

var canvasSingleton = null;

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


exports = Class(BufferedCanvas, function(supr) {

	var stateKeys = 
		[
			'font','stroke', 'patternQuality', 'fillPattern', 'strokePattern', 'globalAlpha', 
			'textAlignment', 'textBaseline', 'shadow', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'
		];

	this.init = function(){
		supr(this,"init",arguments);
		this._stack = [];
	}

	this._ctx = {}; // for legacy getters and setters
	
	this.show = function() {
		// TODO: NATIVE.gl.show();
	}
	
	this.hide = function() {
		// TODO: NATIVE.gl.hide();
	}
	
	this.clear = function() {
		NATIVE.gl.clear();
	}
	
	this.execSwap = function(operations) {}

	this.save = function(){
		NATIVE.gl.push();
		var state = {};
		for (var i = 0, key; key = stateKeys[i]; ++i){
			state[key] = this[key];
		}
		this._stack.push(state);
	}

	this.restore = function(){
		NATIVE.gl.pop();
		var state = this._stack.pop();
		for (var i = 0, key; key = stateKeys[i]; ++i){
			this[key] = state[key];
		}
	}

	this.drawImage = function(img, x, y, w, h, dx, dy, dw, dh) {
		NATIVE.gl.drawImage(img.src, x, y, w, h, dx, dy, dw, dh);
	}
	
	this.translate = NATIVE.gl.translate;
	this.rotate = function(r) {
		NATIVE.gl.rotate(r, 0, 0, 1);
	}
	this.scale = NATIVE.gl.scale;
	
	this.setGlobalAlpha = function(alpha) {
		this._alpha = alpha;
		NATIVE.gl.setAlpha(alpha);
	}
	this.getGlobalAlpha = function() { return this._alpha; }
	
	this.fillRect = function(x, y, width, height) { 
		var color = new RGBA(this.fillStyle);
		NATIVE.gl.fillRect(x, y, width, height, color.r, color.g, color.b, color.a);
	};
	
	this.fillText = function(string, x, y) { 
		var color = new RGBA(this.fillStyle);
		var font = Font.parse(this.font);
		var fontName = font.resolveAgainst(NATIVE.gl.fonts);
		
		NATIVE.gl.fillText(string, x, y, color.r, color.g, color.b, color.a, font.size, fontName);
	};
});


/*
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

	this.rect = wrap('rect');
	this.fillRect = wrap('fillRect');
	this.strokeRect = wrap('strokeRect');

	this.save = wrap('save');
	this.restore = wrap('restore');
	
	this.clip = wrap('clip');
	this.stroke = wrap('stroke');
	this.fill = wrap('fill');
	
	
});
*/