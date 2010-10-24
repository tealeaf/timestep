"use import";

import .View;
import std.js as JS;
import math2D.Rect;
import math2D.Circle;
import math2D.intersect;

exports = Class(View, function(supr) {
	
	var defaults = {
		fullWidth: 0,
		fullHeight: 0,
		offsetX: 0,
		offsetY: 0
	}
	
	this.init = function(opts) {
		supr(this, 'init', arguments);
		opts = JS.merge(opts, defaults);
		
		this._contentView = new View({
			width: opts.fullWidth,
			height: opts.fullHeight,
			x: opts.offsetX,
			y: opts.offsetY
		});
		
		this._contentView.setSuperView(this);
	}
	
	this.getOffsetX = function() { return this._contentView.style.x; }
	this.getOffsetY = function() { return this._contentView.style.y; }
	this.setOffsetX = function(x) { this._contentView.style.x = x; }
	this.setOffsetY = function(y) { this._contentView.style.y = y; }
	
	this.getFullWidth = function() { return this._contentView.style.width; }
	this.getFullHeight= function() { return this._contentView.style.height; }
	
	this._renderSubviews = function(ctx) {
		var s = this.style,
			scale = s.scale,
			cvs = this._contentView.style,
			viewable = new math2D.Rect(cvs.x, cvs.y, s.width / scale, s.height / scale);
		
		ctx.translate(-viewable.x, -viewable.y);
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			var s = view.getBoundingShape(),
				draw = false;
			if (s instanceof math2D.Circle) {
				draw = math2D.intersect.circleAndRect(s, viewable);
			} else if (s instanceof math2D.Rect) {
				draw = math2D.intersect.rectAndRect(s, viewable);
			}
			if (draw) { view.wrapRender(ctx); }
		}
	}
});
