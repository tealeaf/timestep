"use import";

import std.js as JS;
import ..Sprite;
import ..animate;

exports = Class(Sprite, function(supr) {
	this.init = function(opts) {
		opts = JS.merge(opts, {
			animations: {
				'default': {frames: [[0, 0]], imageUrl: opts.imageUrl, width: opts.width, height: opts.height},
				'hover': {frames: [[0, opts.height]], imageUrl: opts.imageUrl, width: opts.width, height: opts.height},
				'pressed': {frames: [[0, opts.height * 2]], imageUrl: opts.imageUrl, width: opts.width, height: opts.height}
			},
			color: '#FFF'
		});
		
		supr(this, 'init', [opts]);
		
		this._label = opts.label;
		this._isEnabled = true;
		this._isPressed = false;
		
		this.style.color = opts.color;
		this.startAnimation('default');
	}
	
	this.enable = function() {
		this._isEnabled = true;
		animate(this).now({opacity: 1});
	}
	
	this.disable = function() {
		this._isEnabled = false;
		animate(this).now({opacity: 0.5});
	}
	
	this.onInputStart = function() {
		this._isPressed = true;
		if (this._isEnabled) {
			this.startAnimation('pressed');
		}
	}
	
	this.onInputSelect = function() {
		this._isPressed = false;
		if (this._isEnabled) {
			this.startAnimation('hover');
			this.publish('Select');
		}
	}
	
	this.onInputOver = function() {
		if (this._isEnabled) { this.startAnimation('hover'); }
	}
	
	this.onInputOut = function() {
		this.startAnimation('default');
	}
	
	this.setLabel = function(label) { this._label = label; }
	
	this.render = function(ctx) {
		supr(this, 'render', arguments);
		
		ctx.setFillStyle(this.style.color);
		
		var x = 25;
		if (ctx.measureText) {
			x = Math.max(this.style.width / 2 - ctx.measureText(this._label).width / 2, x);
		}
		
		ctx.fillText(this._label, x, 25, this.style.width - 25);
	}
});
