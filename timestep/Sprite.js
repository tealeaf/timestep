jsio('from .util import mergeDefaults');
jsio('import .Image, .View');
jsio('import std.js as JS');

var Sprite = exports = Class(View, function(supr) {
	var defaults = {
		defaultWidth: 64,
		defaultHeight: 64,
		animations: {}
	}
	
	this.init = function(opts) {
		supr(this, 'init', arguments);
		opts = JS.merge(opts, defaults);
		this._animations = {}
		for (key in opts.animations) {
			this._animations[key] = new SpriteAnimation(opts.animations[key]);
		}
		
		this._spriteOffsetX = opts.offsetX;
		this._spriteOffsetY = opts.offsetY;
		this._animationCallback = null;
		this._animationIterations = 0;
		this._animationMirroredHorizontal = false;
		this._animationMirroredVertical = false;
		this._currentAnimation = null;
	}
	
	this.getFront = function(width) {
		if (!this._currentAnimation) {
			return 0;
		}
		return this._currentAnimation.getFront(width);
	}
	this.addAnimation = function(name, args) {
		this._animations[name] = new SpriteAnimation(args);
	}
	
	this.startAnimation = function(name, opts) {
		opts = opts || {}
		var frame = opts.frame || 0;
		var dt = 0;
		this._animationIterations = opts.iterations || 0;
		this._animationCallback = opts.callback || function() {}
		this._animationMirroredHorizontal = !!opts.mirrorHorizontal;
		this._animationMirroredVertical = !!opts.mirrorVertical;
		this._currentAnimation = this._animations[name]
		if (!!opts.randomFrame) {
			frame = Math.floor(Math.random() * 64);
			dt = Math.floor(Math.random() * 1000);
			logger.info('frame is', frame);
		}
		
		this._isPaused = false;
		this._currentAnimation.reset(frame, dt);
	}
	
	this.isCurrentAnimation = function(name) {
		return this._currentAnimation == this._animations[name];
	}
	
	this.pauseAnimation = function() {
		this._isPaused = true;
	}
	
	this.stopAnimation = function() {
		this._currentAnimation = null;
	}
	
	this.tick = function(dt) {
		if (this._currentAnimation && !this._isPaused) {
			var iterations = this._currentAnimation.tick(dt);
			if (iterations && this._animationIterations > 0) {
				this._animationIterations -= iterations;
				if (this._animationIterations <= 0) {
					this._currentAnimation = null;
					var cb = this._animationCallback;
					this._animationCallback = null;
					cb();
				}
			}
		}
	}
	
	this.render = function(ctx) {
		if (this._currentAnimation) {
			ctx.translate(
				(this._spriteOffsetX | 0) + (this._animationMirroredHorizontal ? this._width : 0),
				(this._spriteOffsetY | 0) + (this._animationMirroredVertical ? this._height: 0));
			
			if (this._animationMirroredHorizontal) {
				ctx.scale(-1, 1);
			}
			if (this._animationMirroredVertical) {
				ctx.scale(1, -1);
			}
			this._currentAnimation.render(ctx, this);
		}
	}
	
});


var SpriteAnimation = Class(function() {
	var defaults = {
		frameRate: 10,
		width: 128,
		height: 128,
		imageUrl: "about:blank",
		frames: [ (0,0) ],
		front: 0
	}
	
	this.init = function(opts) {
		var opts = this._opts = mergeDefaults(opts, defaults);
		this._frames = [];
		for (var i =0, frame; frame = opts.frames[i]; ++i) {
			this._frames.push(new Image({
				sourceW: opts.width,
				sourceH: opts.height,
				sourceX: frame[0],
				sourceY: frame[1],
				url: opts.imageUrl
			}));
		}
		this._frame = 0
		this._dt = 0;
		this._front = opts.front;
	}
	this.getFront = function(width) {
		width = width || this._opts.width;
		return this._front * width / this._opts.width;
	}
	this.render = function(ctx, view) {
		this._frames[this._frame].render(ctx, 0, 0, view.getWidth(), view.getHeight());
	}
	
	this.reset = function(frame, dt) {
		this._frame = frame % (this._opts.frames.length);
		this._dt = dt % (Math.floor(1000 / this._opts.frameRate));
	}
	
	this.tick = function(dt) {
		if (!this._opts.frameRate) { return; }
		this._dt += dt;
		if (!this._opts.step) {
			var step = 1000 / this._opts.frameRate;
		} else {
			var step = this._opts.step;
		}
		var iterations = 0;
		while (this._dt > step) {
			this._dt -= step;
			this._frame = (++this._frame) % this._opts.frames.length;
			if (this._frame == 0) {
				iterations += 1;
			}
		}
		return iterations;
	}
});