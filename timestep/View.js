"use import";

import lib.PubSub;
import lib.Sortable;

import std.js as JS;
import math2D.Point as Point;
import math2D.Rect as Rect;
import math2D.Circle as Circle;
import math2D.intersect as Intersect;

import .InputEvent;
import .ViewDebugger;

var UID = 0;

var View = exports = Class(lib.PubSub, function() {
	
	// Default parameters for 
	var defaults = {
		x: 0,
		y: 0,
		r: 0,
		zIndex: 0,
		width: 0,
		height: 0,
		backgroundColor: 'rgba(0,0,0)',
		opacity: 1.0,
		circle: false, // bounding box or bounding circle
		infinite: false, // no bounding shape at all (e.g. infinite scroll plane)
		debug: null,
		clip: false,
		canHandleEvents: true,
		clickable: true,
		trackClicks: true,
		parent: null
	}
	
	this.init = function(opts) {
		this._opts = opts = JS.merge(opts, defaults);
		this._inputData = {};
		this.uid = ++UID + (opts.id || '');
		
		this.style = {
			x: opts.x,
			y: opts.y,
			z: opts.zIndex,
			r: opts.r,
			radius: opts.radius,
			width: opts.width,
			height: opts.height,
			zIndex: opts.zIndex,
			opacity: opts.opacity,
			scale: 1,
			visible: true
		};

		this._subViews = [];
		this._superView = null;
		this.debug = new ViewDebugger(this, opts.debug);
		this._circle = opts.circle;
		this._infinite = opts.infinite;
		this._clip = opts.clip;
		this._clickable = opts.clickable;
		this._canHandleEvents = opts.canHandleEvents;
		this._clicks = [];
		
		if (opts.parent) {
			if (!opts.width && !opts.height) {
				this.style.width = opts.parent.style.width;
				this.style.height = opts.parent.style.height;
			}
			opts.parent.addSubview(this);
		}
	}
	
	this.needsRepaint = function() { this._needsRepaint = true; }
	this.needsSort = function() { this._needsRepaint = true; this._needsSort = true; }
	
	this.getSuperView = function() {
		return this._superView;
	}
	
	this.addSubview = function(view) {
		if (view._superView) {
			if (view._superView == this) { return; }
			view.remove();
		}
		
		this._subViews.push(view);
		view.setSuperView(this);
		this.needsSort();
		return view;
	}
	
	this.sort = function() {
		this._needsSort = false;
		lib.Sortable.sort(this._subViews, function() { return this.style.zIndex; });
	}
	
	this.remove = function() {
		if (this._superView) {
			this._superView.removeSubview(this);
		}
	}
	
	this.removeSubview = function(targetView) {
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			if (view === targetView) {
				this._subViews.splice(i, 1);
				if (targetView._superView == this) {
					targetView._superView = null;
				}
				this.needsRepaint();
				break;
			}
		}
	}
	
	this.removeAllSubviews = function() {
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			if (view._superView === this) {
				view._superView = null;
			}
		}
		this._subViews = [];
	}
	
	this.removeFromSuperview = function() {
		if (this._superView) {
			this._superView.removeSubview(this);
			this._superView = null;
		}
	}
	
	this.setSuperView = function(view) {
		this._superView = view;
	}
	
	this.wrapRender = function(ctx, dt) {
		if (this._needsSort) { this.sort(); }
		
		var s = this.style;
		if (!s.visible) { return; }
		
		ctx.save();
		ctx.translate((s.x + 0.5) | 0, (s.y + 0.5) | 0);
		if (s.r) { ctx.rotate(s.r); }
		if (s.scale != 1) { ctx.scale(s.scale, s.scale); }
		
		if (this._clip) { // clip this render to be within its view;
			ctx.beginPath();
			ctx.rect(0, 0, s.width, s.height);
			ctx.clip();
		}
		
		if (this.debug) { this.debug.preRender(ctx, dt); }
		
		ctx.setGlobalAlpha(s.opacity);
		var err = null;
		try {
			this.render(ctx);
			this._renderSubviews(ctx, dt);
		} finally {
			if (this.debug) { this.debug.postRender(ctx, dt); }
			ctx.restore();
		}
	}
	
	this._renderSubviews = function(ctx, dt) {
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			view.wrapRender(ctx, dt);
		}
	}
	
	this.wrapTick = function(dt, app) {
		this.tick(dt, app);
		for (var i = 0, view; view = this._subViews[i]; ++i) {
			view.wrapTick(dt, app);
		}
		
		if (this._needsRepaint) {
			this._needsRepaint = false;
			app.needsRepaint();
		}
	}
	
	this._shouldHandleEvt = function(pt) {
		// top-view(s) capture all
		if (!this._superView) { return true; }
		
		var contains = this.containsPt(pt);
		return contains;
	}
	
	this.containsPt = function(pt) {
		if (this._infinite) { return true; }  // infinite plane

		var s = this.style;
		if (this._circle && !this.style.radius) { this.updateRadius(); }
		return this._circle
				? pt.x * pt.x + pt.y * pt.y < s.radius * s.radius  // bounding circle
				: Intersect.ptAndRect(pt, new Rect(0, 0, s.width, s.height));  // bounding box
	}
	
	this.getBoundingShape = function() {
		var s = this.style;
		if (this._circle) {
			return new Circle(s.x, s.y, s.radius / s.scale);
		} else {
			return new Rect(s.x, s.y, s.width / s.scale, s.height / s.scale);
		}
	}
	
	this.updateRadius = function() {
		var s = this.style,
			w = s.width,
			h = s.height;
			
		s.radius = 0.5 * Math.sqrt(w * w + h * h);
	}
	
	this._translatePt = function(pt) {
		var s = this.style,
			pt = Point.translate(pt, -s.x, -s.y); // make sure to return a copy
		if (s.r) { pt.rotate(-s.r); }
		return pt;
	}
	
	this._onInputOver = function() {
		if (this._isInputOver) { return; }
		this._isInputOver = true;
		if (this.onInputOver) { this.onInputOver(); }
		this.publish('input:over');
		this.needsRepaint();
	}
	
	this._onInputOut = function() {
		if (!this._isInputOver) { return; }
		this._isInputOver = false;
		if (this.onInputOut) { this.onInputOut(); }
		this.publish('input:out');
		this.needsRepaint();
	}
	
	this.isInputOver = function() { return this._isInputOver; }
	
	this.findTarget = function(evt, pt) {
		var pt = this._translatePt(pt);
		if (!this._shouldHandleEvt(pt)) { return false; }
		pt.scale(1 / this.style.scale);
		
		if (this._canHandleEvents) {
			evt.depth++;
			evt.trace.unshift(this);
			evt.pt[this.uid] = pt;
		}
		
		for (var v = this._subViews, i = v.length - 1; i >= 0; --i) {
			if (v[i].findTarget(evt, pt)) {
				return true;
			}
		}
		
		if (this._canHandleEvents) {
			evt.target = this;
			return true;
		}
	}
	
	this.dispatchEvent = function(evt) {
		evt.root = this;
		this.findTarget(evt, evt.srcPt);
		var depth = evt.depth;
		
		View._evtHistory[evt.type] = evt;
		
		var cbName = this.getCbName(evt.type);
		
		for (var i = depth - 1; i >= 0; --i) {
			var view = evt.trace[i],
				pt = evt.pt[view.uid];
			view.onEventPropagate(evt, pt, i == 0);
			view.publish(evt.type + ':capture', evt, pt, i == 0);
			if (evt.cancelled) { return; }
		}
		
		for (var i = 0; i < depth; ++i) {
			var view = evt.trace[i];
			if (view._canHandleEvents) {
				var pt = evt.pt[view.uid];
				if (view[cbName]) { view[cbName](evt, pt, i == 0); }
				view.publish(evt.type, evt, pt, i == 0);
				if (evt.cancelled) { break; }
			}
		}
	}
	
	this.getCbName = function(evtType) {
		return 'on' + (evtType.charAt(0).toUpperCase() + evtType.substring(1)).replace(/:(.)/g, function(a, b) { return b.toUpperCase(); });
	}
	
	this.onEventPropagate = function(evt, pt, atTarget) {
		if (atTarget) {
			switch(evt.type) {
				case 'input:move':
					// translate input:move events into two higher-level events:
					//   input:over and input:out
					
					// fire input:out events first, start with deepest node and work out
					if (View._inputOverTrace && evt.trace[0] != View._inputOverTrace[0]) {
						var trace = View._inputOverTrace;
						for (var i = 0, view; view = trace[i]; ++i) {
							if (!(view.uid in evt.pt)) {
								view._onInputOut();
							}
						}
					}
					
					// fire input:over events second, start with outermost node and go to target
					trace = evt.trace;
					for (var i = evt.depth - 1; i >= 0; --i) {
						trace[i]._onInputOver();
					}
					
					// update current mouse trace
					View._inputOverTrace = trace;
					break;
			}
		}
	}
	
	this.localizePt = function(pt) {
		var list = this.getParents(),
			i = 0;
		while(list[++i]) { pt = list[i]._translatePt(pt); }
		return pt;
	}
	
	this.localizePtScale = function(pt) {
		var list = this.getParents(),
			i = 0,
			pt = new Point(pt);
		while(list[++i]) { pt.scale(1 / list[i].style.scale); }
		return pt;
	}
	
	this.getParents = function() {
		var list = [this];
		while(list[0]._superView) { list.unshift(list[0]._superView); }
		return list;
	}
	
	this.startDrag = function() {
		if (this._isDragging) { return; }
		this._isDragging = true;
		
		var inputStartEvt = View._evtHistory['input:start'],
			root = inputStartEvt.root,
			dragEvt = new InputEvent('input:drag', inputStartEvt.srcPt, root, this);
		
		root.subscribe('input:move:capture', this, '_onDragStart', dragEvt);
		root.subscribe('input:move:capture', this, '_onDrag', dragEvt);
		root.subscribe('input:select:capture', this, '_onDragStop', dragEvt);
	}
	
	this.isDragging = function() { return this._isDragging && View._isDragging; }
	
	this._onDragStart = function(dragEvt, moveEvt) {
		dragEvt.root.unsubscribe('input:move:capture', this, '_onDragStart');
		dragEvt.currPt = dragEvt.srcPt;
		dragEvt.didDrag = false;
		
		this.publish('drag:start', dragEvt);
		if (this.onDragStart) { this.onDragStart(dragEvt); }
	}
	
	this._onDrag = function(dragEvt, moveEvt) {
		dragEvt.prevPt = dragEvt.currPt;
		dragEvt.currPt = moveEvt.srcPt;
		View._isDragging = true;
				
		var delta = Point.subtract(dragEvt.currPt, dragEvt.prevPt);
		this.publish('drag:move', dragEvt, moveEvt, delta);
		if (this.onDrag) { this.onDrag(dragEvt, moveEvt, delta); }
		
		//moveEvt.cancel();
	}
	
	this._onDragStop = function(dragEvt, selectEvt) {
		this._isDragging = false;
		dragEvt.root.unsubscribe('input:move:capture', this, '_onDragStart');
		dragEvt.root.unsubscribe('input:move:capture', this, '_onDrag');
		dragEvt.root.unsubscribe('input:select:capture', this, '_onDragStop');
		
		if (!View._isDragging) { return; }
		View._isDragging = false;
		
		// handler can 'uncancel' the selectEvt by setting 'selectEvt.cancelled = false;'
		selectEvt.cancel();
		
		this.publish('drag:stop', dragEvt, selectEvt);
		if (this.onDragStop) { this.onDragStop(dragEvt, selectEvt); }
	}
	
	this.tick = function(dt) {
		// Overriden in subclass
	}
		
	this.render = function(ctx) {
		// Overriden in subclass
	}
	
	this.getHeight = function() { return this.style.height; }
	this.getWidth = function() { return this.style.width; }
	this.setHeight = function(h, andW) {
		var s = this.style;
		if (andW) { s.width = h * s.width / s.height; }
		s.height = h;
	}
	
	this.setWidth = function(w, andH) {
		var s = this.style;
		if (andH) { s.height = w * s.height / s.width; }
		s.width = w;
	}
	
	this.getPos = function() {
		var s = this.style;
		return {
			x: s.x,
			y: s.y,
			width: s.width,
			height: s.height,
			r: s.r
		};
	}
	this.getX = function() { return this.style.x; }
	this.getY = function() { return this.style.y; }
	this.getR = function() { return this.style.r; }
	this.setX = function(x) { this.style.x = x; return this; }
	this.setY = function(y) { this.style.y = y; return this; }
	this.setR = function(r) { this.style.r = r; return this; }
	this.setStyle = function(style) {
		var s = this.style;
		for(var i in style) {
			if (style.hasOwnProperty(i) && s.hasOwnProperty(i)) {
				s[i] = style[i];
			}
		}
		
		// TODO: use a getter/setter?
		if ('zIndex' in style) {
			this.setZIndex(style.zIndex);
		}
		
		if (('width' in style) || ('height' in style)) {
			this.updateRadius();
		}
	}
	this.getStyle = function() { return JS.shallowCopy(this.style); }
	
	this.getCD = function() { // distance to center from corner
		var s = this.style,
			x = s.width / 2,
			y = s.height / 2;
		return Math.sqrt(x * x + y * y);
	}
	this.getCA = function() { // angle to center unrotated
		var s = this.style;
		return Math.atan(s.height / s.width);
	}
	this.getCX = function() { var s = this.style; return s.x + this.getCD() * Math.cos(s.r + this.getCA()); }
	this.getCY = function() { var s = this.style; return s.y + this.getCD() * Math.sin(s.r + this.getCA()); }
	this.setCX = function(x) { var s = this.style; s.x = x - s.width / 2; }
	this.setCY = function(y) { var s = this.style; s.y = y - s.height / 2; }
	this.rotateAtCenter = function(r) {
		var s = this.style,
			ca = this.getCA(),
			cd = this.getCD(),
			r0 = s.r;
		
		s.r = r;
		s.x -= cd * (Math.cos(r + ca) - Math.cos(r0 + ca));
		s.y -= cd * (Math.sin(r + ca) - Math.sin(r0 + ca));
	}
	
	this.getBounds = function() { var s = this.style; return [s.x, s.y, s.width, s.height]; }
	this.setBounds = function(bounds) {
		var s = this.style;
		s.x = bounds[0];
		s.y = bounds[1];
		s.width = bounds[2];
		s.height = bounds[3];
	}
	
	this.setZIndex = function(zIndex) {
		this.style.zIndex = zIndex;
		if (this._superView) { this._superView.needsSort(); }
		return this;
	}
	
	this.setOpacity = function(opacity) { this.style.opacity = opacity; }
	this.getOpacity = function() { return this.style.opacity; }
	
	this.getAbsolutePos = function() {
		var abs = new Point(),
			view = this,
			r = 0,
			s = this.style,
			w = s.width,
			h = s.height,
			c = 1;
		
		while(view) {
			var scale = view.style.scale;
			abs.scale(scale).rotate(view.style.r).add(view.style);
			r += view.style.r;
			w *= scale;
			h *= scale;
			c *= scale;
			view = view._superView;
		}
		
		return {
			x: abs.x,
			y: abs.y,
			r: r % (2 * Math.PI),
			width: w,
			height: h,
			scale: c
		};
	}
	
	this.toString = function() { return 'View' + this.uid; }
});

View._evtHistory = {};
View._isDragging = false;
View.isDragging = function() { return this._isDragging; }
