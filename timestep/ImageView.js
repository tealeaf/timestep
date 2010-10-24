jsio('import .View');
jsio('import .Image');
jsio('from .util import mergeDefaults');
jsio('import std.js as JS');

var ImageView = exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);
		
		opts = JS.merge(opts, {
			image: null,
			autoSize: false
		});
		
		if (typeof opts.image == 'string') {
			this._img = new Image({url:opts.image});
		} else {
			this._img = opts.image;
		}
		
		if (opts.autoSize) { this._img.doOnLoad(this, 'autoSize'); }
	}
	
	this.doOnLoad = function() { this._img.doOnLoad.apply(this._img, arguments); return this; }
	this.autoSize = function(width, height) {
		var s = this.style;
		s.width = this._img.getOrigW();
		s.height = this._img.getOrigH();
		this.updateRadius(); // computes radius based on width/height
	}
	
	this.getOrigW = function() { return this._img.getOrigW(); }
	this.getOrigH = function() { return this._img.getOrigH(); }
		
	this.render = function(ctx) {
		if (this._img) {
			var s = this.style;
			if (this._circle) {
				this._img.render(ctx, -s.width / 2, -s.height / 2, s.width, s.height);
			} else {
				this._img.render(ctx, 0, 0, s.width, s.height);
			}
		}
	}
});
