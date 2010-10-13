"use import";
import std.js as JS;

exports = Class(function() {
	
	this.init = function(target, opts) {
		this._target = target;
		this._opts = opts = JS.merge(opts, {
			trackClicks: false,
			outline: false,
			flash: false
		});
		
		this.outline = opts.outline;
		this.trackClicks = opts.trackClicks;
		this.flash = opts.flash;
		
		this._flashState = 0;
		this._nextFlash = 0;
	}
	
	this.preRender = function(ctx, dt) {
		if (this.outline) {
			ctx.save();
			ctx.setGlobalAlpha(0.2);
			ctx.setStrokeStyle('#000');
			if (this._circle) {
				ctx.beginPath();
				ctx.arc(0, 0, s.radius, 0, 360, false);
				ctx.stroke();
				ctx.closePath();
			} else {
				ctx.setLineWidth(1.0);
				ctx.strokeRect(0, 0, s.width, s.height);
			}
			ctx.restore();
		}
	}
	
	this.postRender = function(ctx, dt) {
		var t = this._target;
		if (this.trackClicks) {
			for (var i = t._clicks.length - 1; i >= 0; --i) {
				var c = t._clicks[i];
				ctx.setFillStyle('rgba(0, 0, 0, ' + c.o + ')');
				c.o -= 0.4 * dt / 1000;
				if (c.o > 0) {
					ctx.fillCircle(c.x, c.y, 15);
				} else {
					t._clicks.splice(i, 1);
				}
			}
		}
		
		if (this.flash) {
			switch(this._flashState) {
				case 0:
					ctx.setFillStyle('rgba(0, 0, 0, 0.5)');
					break;
				case 1:
					ctx.setFillStyle('rgba(0, 0, 0, 0)');
					break;
				case 2:
					ctx.setFillStyle('rgba(255, 255, 255, 0.5)');
					break;
				case 3:
					ctx.setFillStyle('rgba(0, 0, 0, 0)');
					break;
			}
			
			var now = +new Date();
			if (now > this._nextFlash) {
				this._flashState = (this._flashState + 1) % 4;
				this._nextFlash = now + 300;
			}
			
			if (t._circle) {
				
			} else {
				ctx.fillRect(0, 0, t.style.width, t.style.height);
			}
		}
	}
});
