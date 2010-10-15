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
		
		var el = document.createElement('canvas');
		el.style.cssText = 'position: absolute; top: 0px; left: 0px; z-index: 1';
		
		el.width = this._opts.width;
		el.height = this._opts.height;
		
		var ctx = el.getContext('2d');
		ctx.el = el;
		ctx.show = function() {
			Document.getContainer().appendChild(el);
		};
		
		ctx.hide = function() {
			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}
		};
		
		ctx.clear = function() {
			this.clearRect(0, 0, el.width, el.height);
		};
		
		ctx.swap = function() {};
		ctx.execSwap = function() {};
		
		ctx.strokeCircle = function(x, y, radius) {
			this.beginPath();
			this.arc(x, y, radius, 0, 2 * Math.PI, true);
			this.stroke();
		}
		
		ctx.fillCircle = function(x, y, radius) {
			this.beginPath();
			this.arc(x, y, radius, 0, 2 * Math.PI, true);
			this.fill();
		}
		
		ctx.loadIdentity = function() {
			this.setTransform(1, 0, 0, 1, 0, 0);
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
});