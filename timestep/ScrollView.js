"use import";

import .View;
import std.js as JS;
import math2D.Rect;
import math2D.Point;
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
			y: opts.offsetY,
			infinite: true
		});
		
		supr(this, 'addSubview', [this._contentView]);
	}
	
	this.addSubview = function(view) { return this._contentView.addSubview(view); }
	this.removeSubview = function(view) { return this._contentView.removeSubview(view); }
	
	this.getOffset = function() { return new math2D.Point(this._contentView.style); }
	this.setOffset = function(p) {
		this._contentView.style.x = p.x;
		this._contentView.style.y = p.y;
	}
	
	this.getContentView = function() { return this._contentView; }
	
	this.getFullWidth = function() { return this._contentView.style.width; }
	this.getFullHeight= function() { return this._contentView.style.height; }
	
	this._renderSubviews = function(ctx) {
		var s = this.style,
			scale = s.scale,
			cvs = this._contentView.style,
			viewable = new math2D.Rect(-cvs.x, -cvs.y, s.width / scale, s.height / scale),
			views = this._contentView._subViews;
		
		ctx.translate(-viewable.x, -viewable.y);
		for (var i = 0, view; view = views[i]; ++i) {
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
