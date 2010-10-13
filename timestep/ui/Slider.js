"use import";

import ..View;
import std.js as JS;
import .roundedRect;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		opts = JS.merge(opts, {
			min: 0,
			max: 1,
			initial: 0.5,
			discrete: false,
			isHorizontal: true
		});
		
		this._discrete = opts.discrete;
		this._value = opts.initial;
		this._min = opts.min;
		this._max = opts.max;
		this._isHorizontal = opts.isHorizontal;
		this._key = this._isHorizontal ? 'x' : 'y';
		
		supr(this, 'init', arguments);
	}
	
	this.inputStart = function() {
		this.startDrag();
	}
	
	this.onDragStart = function() {
		this._prevValue = this._value;
	}
	
	this._setValFromPt = function(pt) {
		this._value = pt[this._key] / this.style.width * (this._max - this._min) + this._min;
		if (this._value < this._min) { this._value = this._min; }
		if (this._value > this._max) { this._value = this._max; }
	}
	
	this.onDrag = function(startPt, currentPt, delta) {
		var oldValue = this._value;
		this._setValFromPt(currentPt);
		this.publish('Changing', this._value, oldValue);
	}
	
	this.onDragStop = function(startPt, currentPt, delta) {
		var oldValue = this._value;
		this._setValFromPt(currentPt);
		this.publish('Changing', this._value, oldValue);
		this.publish('Change', this._value, this._prevValue);
	}
	
	var style = {
		thickness: 2,
		borderRadius: 5,
		thickness: 20,
		barRadius: 2
	}
	
	this.render = function(ctx) {
		var s = this.style,
			c = s.height / 2,
			x = (this._value - this._min) / (this._max - this._min) * s.width + s.x,
			t = style.thickness / 2;

		ctx.setLineWidth(1);
		ctx.setStrokeStyle('#888');
		ctx.setFillStyle('#AAA');
		
		ctx.beginPath();
		roundedRect(ctx, 0, c - style.barRadius, s.width, style.barRadius * 2, style.barRadius);
		roundedRect(ctx, x - t, 0, style.thickness, s.height, style.borderRadius);
		ctx.stroke();
		ctx.fill();
	}
});
