jsio('from ..canvas import BufferedCanvas');
jsio('import ..Document');

function setter(name) {
	return (function(val) {
		return (this[name] = val);
	});
}

function getter(name) {
	return (function(val) {
		return this[name];
	});
}

exports = Class(BufferedCanvas, function(supr) {
	this.init = function() {
		supr(this, 'init', arguments);
		
		var canvas = this._canvas = document.createElement('canvas');
		canvas.style.cssText = 'position: absolute; top: 0px; left: 0px; z-index: 1';
		
		this._canvas.width = this._opts.width;
		this._canvas.height = this._opts.height;
		
		
		var ctx = this._canvas.getContext('2d');
		ctx.show = function() {
			Document.getContainer().appendChild(canvas);
		};
		
		ctx.hide = function() {
			if (canvas.parentNode) {
				canvas.parentNode.removeChild(canvas);
			}
		};
		
		ctx.swap = function() {};
		ctx.execSwap = function() {};
		
		ctx.fillCircle = function(x, y, radius, fillStyle) {
			this.beginPath();
			this.arc(x, y, radius, 0, 2 * Math.PI, true);
			this.fill();
		}
		
		ctx.setGlobalAlpha = setter('globalAlpha');
		ctx.getGlobalAlpha = getter('globalAlpha');

		ctx.setFillStyle = setter('fillStyle');
		ctx.getFillStyle = getter('fillStyle');

		ctx.setStrokeStyle = setter('strokeStyle');
		ctx.getStrokeStyle = getter('strokeStyle');

		ctx.setLineWidth = setter('lineWidth');
		ctx.getLineWidth = getter('lineWidth');

		ctx.setShadowOffsetX = setter('shadowOffsetX');
		ctx.getShadowOffsetX = getter('shadowOffsetX');
		ctx.setShadowOffsetY = setter('shadowOffsetY');
		ctx.getShadowOffsetY = getter('shadowOffsetY');
		ctx.setShadowBlur    = setter('shadowBlur');
		ctx.getShadowBlur    = getter('shadowBlur');
		ctx.setShadowColor   = setter('shadowColor');
		ctx.getShadowColor   = getter('shadowColor');

		ctx.setFont = setter('font');
		ctx.getFont = getter('font');
		ctx.setTextAlign = setter('textAlign');
		ctx.getTextAlign = getter('textAlign');
		ctx.setTextBaseline = setter('textBaseLine');
		ctx.getTextBaseline = getter('textBaseLine');

		return ctx;
	}
	
	this.execSwap = function(operations) {
		this._ctx.clearRect(0,0,this._canvas.width, this._canvas.height);
		for (var i = 0, op; op = operations[i]; ++i) {
			var name = op[0];
			var args = op[1];
			if (name == 'set') {
				this._ctx[args[0]] = args[1];
			} else {
				try {
					this._ctx[name].apply(this._ctx, args);
				} 
				catch(e) {
					logger.info('error on', name, args);
//					throw e;
				}
			}
		}
	}
})