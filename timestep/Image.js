"use import";

from .util import mergeDefaults;
import std.js as JS;
import lib.Callback;

ImageCache = {};
function imageOnLoad(status, success) {
	status.cb.fire(success);
	this.onLoad = this.onError = null;
}

exports = Class(function() {
	this.init = function(opts) {
		opts = JS.merge(opts, {
			sourceW: -1,
			sourceH: -1,
			sourceX: 0,
			sourceY: 0,
			url: ""
		});
		
		this._url = opts.url;
		this._sourceW = opts.sourceW;
		this._sourceH = opts.sourceH;
		this._sourceX = opts.sourceX;
		this._sourceY = opts.sourceY;
		this._cb = new lib.Callback();
		
		var status = ImageCache[opts.url];
		if (status) {
			this._sourceImage = status.img;
		} else {
			var img = this._sourceImage = new Image(),
				cb = new lib.Callback();
			
			status = ImageCache[opts.url] = {
				img: img,
				cb: cb
			};
			
			img.onload = bind(img, imageOnLoad, status, true);
			img.onerror = bind(img, imageOnLoad, status, false);
			img.src = this._url = opts.url;
		}
		
		this._isReady = false;
		this._cb.run(this, '_onLoad');
		status.cb.run(this._cb.chain());
	}
	
	this.getOrigW = function() { return this._sourceImage.width; }
	this.getOrigH = function() { return this._sourceImage.height; }
	
	this.setSourceW = function(w) { this._sourceW = w; }
	this.setSourceH = function(h) { this._sourceH = h; }
	this.setSourceY = function(y) { this._sourceY = y; }
	this.setSourceX = function(x) { this._sourceX = x; }
	
	this.getWidth = function() { return (this._sourceW == -1 ? 0 : this._sourceW); }
	this.getHeight = function() { return (this._sourceH == -1 ? 0 : this._sourceH); }
	
	// register a callback for onload
	this.doOnLoad = function() { this._cb.forward(arguments); return this; }
	
	// internal onload handler for actual Image object
	this._onLoad = function(success) {
		if (!success) {
			// TODO: something better?
			logger.error('Image failed to load:', this._url)
			return;
		}
		
		this._isReady = true;
		if (this._sourceW == -1) { this._sourceW = this._sourceImage.width; }
		if (this._sourceH == -1) { this._sourceH = this._sourceImage.height; }
		this._cb.fire(this._url, this._sourceW, this._sourceH);
	}
	
	this.isReady = function() { return this._isReady; }
	this.render = function(ctx, destX, destY, destW, destH) {
		if (!this._isReady) { return; }
		try {
			ctx.drawImage(this._sourceImage, this._sourceX, this._sourceY, this._sourceW, this._sourceH, destX|0, destY|0, destW|0, destH|0);
		} catch(e) {}
	}
});