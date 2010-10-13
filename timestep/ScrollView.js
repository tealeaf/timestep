"use import";

import .View;
import std.js as JS;

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
		
		this._fullWidth = opts.fullWidth || opts.width;
		this._fullHeight = opts.fullHeight || opts.height;
		this._offsetX = opts.offsetX;
		this._offsetY = opts.offsetY;
		
	}
	
	this.getOFfset 
	
	this.getOffsetX = function() {
		return this._offsetX;
	}
	
	this.getOffsetY = function() {
		return this._offsetY;
	}
	
	this.setOffsetX = function(x) {
		this._offsetX = x > 0 ? x : 0;
	}
	
	this.setOffsetY = function(y) {
		this._offsetY = y > 0 ? y : 0;
	}
	
	this.getFullWidth = function() {
		return this._fullWidth;
	}
	
	this.getFullHeight= function() {
		return this._fullHeight;
	}
	
	this._renderSubviews = function(ctx) {
		var x1 = this._offsetX;
		var y1 = this._offsetY;
		var x2 = x1 + this._width;
		var y2 = y1 + this._height;
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			var viewX1 = view.getX();
			var viewY1 = view.getY();
			var viewX2 = viewX1 + view.getWidth();
			var viewY2 = viewY1 + view.getHeight();
			if (viewX1 <= x2 && viewX2 >= x1 && viewY1 <= y2 && viewY2 >= y1) {
				ctx.translate(-Math.floor(this._offsetX), -Math.floor(this._offsetY));
				view.wrapRender(ctx);
			}
		}
	}

	
})