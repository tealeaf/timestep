jsio('import .canvas');
jsio('import .Timer');
jsio('import .StackView');
jsio('import .device');
jsio('import .input');
jsio('import std.js as JS');
jsio('import lib.PubSub as PubSub');
jsio('import .KeyListener');
jsio('import math2D.Point as Point');
jsio('from util.browser import $');

var __instance = null;

var Application = exports = Class(PubSub, function(supr) {
	this.init = function(opts) {
		if (!__instance) { __instance = this; }
		
		this._opts = opts = JS.merge(opts, {
			keyListenerEnabled: true,
			width: device.width,
			height: device.height,
			view: null,
			dtFixed: 0,
			dtMinimum: 0,
			alwaysRepaint: true,
			repaintOnEvent: false,
			el: $ ? $({}) : null // TODO: hack to create an element in the browser versus iphone
		});
		
		Timer.onTick = bind(this, '_tick');
		
		this._el = this._opts.el;
		
		this._view = opts.view || new StackView({
			width: opts.width,
			height: opts.height
		});
		
		// TODO: this is ugly
		this._canvas = canvas.newCanvas({
			width: opts.width,
			height: opts.height,
			parent: this._el
		});
		
		this._input = new input(this._canvas);
		
		this._keyListener = new KeyListener();
		this._keyListener.setEnabled(this._opts.keyListenerEnabled);
		this._FPSLastRender= 0;
		this._FPSCount = 0;
		this._FPS = 0;
		this._tickBuffer = 0;
		this._onTick = [];
	}
	
	this.getInput = function() { return this._input; }
	this.getCanvas = function() { return this._canvas; }
	
	this.getView = function() { return this._view; }
	this.setView = function(view) { this._view = view; }
	
	this.show = function() { this._canvas.show(); }
	this.hide = function() { this._canvas.hide(); }
	
	this.startLoop = function(dtMin) {
		this.now = 0;
		Timer.start(dtMin || this._opts.dtMinimum);
	}
	
	this.stopLoop = function() {
		Timer.stop();
	}
	
	this.doOnTick = function(cb) {
		if (arguments.length > 1) { cb = bind.apply(this, arguments); }
		this._onTick.push(cb);
	}
	
	this._tick = function(dt) {
		this._needsRepaint = false;
		
		for (var i = 0, cb; cb = this._onTick[i]; ++i) { this._onTick[i]; }
		
		var evts = this._input.getEvents();
		for (var i = 0, evt; evt = evts[i]; ++i) {
			evt.srcApp = this;
			this._view.dispatchEvent(evt);
			
			if (this._opts.repaintOnEvent) { this.needsRepaint(); }
		}
		
		if (this._opts.dtFixed) {
			this._tickBuffer += dt;
			while (this._tickBuffer >= this._opts.dtFixed) {
				this._tickBuffer -= this._opts.dtFixed;
				this.now += this._opts.dtFixed;
				this.__tick(this._opts.dtFixed);
			}
		} else {
			this.__tick(dt);
		}
		
		if (this._opts.alwaysRepaint || this._needsRepaint) {
			this._render(dt);
		}
	}
	
	this._render = function(dt) {
		this._canvas.clear();
		this._view.wrapRender(this._canvas, dt);
		if (dt != undefined && this._opts.showFPS) {
			this._drawFPS(dt);
		}
		this._canvas.swap();
	}
	
	this.render = function() { this._render(0); }
	
	this.needsRepaint = function() { this._needsRepaint = true; }
	
	this.__tick = function(dt) {
		this.publish('Tick', dt);
		this._view.wrapTick(dt, this);
		if (this._keyListener.clear) {
			this._keyListener.clear();
		}
	}
	
	this._drawFPS = function(dt) {
		this._FPSLastRender += dt;
		this._FPSCount++;
		if (this._FPSLastRender > 1000) {
			var fps = this._FPSCount / this._FPSLastRender * 1000;
			if (fps < 10) {
				this._FPS = (Math.round(fps * 100) / 100).toString();
			} else {
				this._FPS = Math.floor(fps).toString();
			}
			this._FPSCount = 0;
			this._FPSLastRender = 0;
		}
		this._canvas.save();
		this._canvas.beginPath();
		this._canvas.moveTo(0,0);
		this._canvas.lineTo(40,0);
		this._canvas.lineTo(40,20);
		this._canvas.lineTo(0,20);
		this._canvas.lineTo(0,0);
		this._canvas.setFillStyle('rgba(0,0,0,0.7)');
		this._canvas.fill();
		this._canvas.setStrokeStyle('rgba(255,255,255,0.7)');
		this._canvas.setLineWidth(2.0);
		this._canvas.stroke();
		
		this._canvas.beginPath();
		this._canvas.setLineWidth(1.0);
		this._canvas.setFillStyle('white');
		this._canvas.setFont('12pt Arial');
		this._canvas.setTextAlign('center');
		this._canvas.fillText(this._FPS.toString(), 20,15);

		
/*		this._canvas.setStrokeStyle('black');
		this._canvas.setLineWidth(1.0);
		this._canvas.strokeText(this._FPS.toString(), 10, 22);
*/
		this._canvas.restore();
	}
	
});

exports.get = function() { return __instance; }
