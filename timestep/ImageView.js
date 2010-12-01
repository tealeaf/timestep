jsio('import .View');
jsio('import .Image');
jsio('from .util import mergeDefaults');
jsio('import std.js as JS');

/*

autoSize:
	- 'none': draw image at original pixel width/height
	- 'fit': (default) draw image to fit in view width/height
	- 'proportional': draw image to fit in view without changing image proportions
	- 'resize': scale view when image loads to the dimensions of the image

*/

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

		if (this._img && this._img.doOnLoad) {
			this._img.doOnLoad(this, 'autoSize', opts.autoSize);
		}
	}
	
	this.doOnLoad = function() {
		this._img.doOnLoad.apply(this._img, arguments);
		this.needsRepaint();
		return this;
	}
	
	this.autoSize = function(method, url, width, height) {
		switch(method) {
			case 'resize':
			case true:
				this._sizeMethod = 'resize';
				this.style.width = width;
				this.style.height = height;
				this.updateRadius(); // computes radius based on width/height
				break;
			default:
				this._sizeMethod = method || 'fit';
				break;
		}
	}
	
	this.getOrigW = function() { return this._img.getOrigW(); }
	this.getOrigH = function() { return this._img.getOrigH(); }
		
	this.render = function(ctx) {
		if (this._img) {
			var s = this.style;

			switch(this._sizeMethod) {
				case 'none':
					if (this._circle) {
						var w = this._img.getOrigW(),
							h = this._img.getOrigH();
						this._img.render(ctx, -w / 2, -h / 2, w, h);
					} else {
						this._img.render(ctx, 0, 0, w, h);
					}
					break;
				case 'proportional':
					logger.error('"proportional" not implemented yet!');
					break;
				case 'resize':
				case 'fit':
				default:
					if (this._circle) {
						this._img.render(ctx, -s.width / 2, -s.height / 2, s.width, s.height);
					} else {
						this._img.render(ctx, 0, 0, s.width, s.height);
					}
					break;
			}
		}
	}
});
