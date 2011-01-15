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

exports = function(opts) {
	var parentNode = opts.parent,
		el = document.createElement('canvas');
	
	if (!parentNode) {
		el.style.cssText = 'position: absolute; top: 0px; left: 0px; z-index: 1';
	}
	
	el.width = opts.width;
	el.height = opts.height;
	
	var ctx = el.getContext('2d');
	ctx.font = '11px Helvetica';
	ctx.getElement = function() { return el; }
	
	ctx.reset = function() {}
	
	ctx.show = function() {
		if (parentNode) {
			parentNode.appendChild(el);
		} else {
			Document.getContainer().appendChild(el);
		}
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
	
	ctx.circle = function(x, y, radius) {
		this.beginPath();
		this.arc(x, y, radius, 0, 2 * Math.PI, true);
	}
	
	ctx.roundRect = function(x, y, width, height, radius) {
		this.beginPath();
		this.moveTo(x,y+radius);
		this.lineTo(x,y+height-radius);
		this.quadraticCurveTo(x,y+height,x+radius,y+height);
		this.lineTo(x+width-radius,y+height);
		this.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
		this.lineTo(x+width,y+radius);
		this.quadraticCurveTo(x+width,y,x+width-radius,y);
		this.lineTo(x+radius,y);
		this.quadraticCurveTo(x,y,x,y+radius);
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
};