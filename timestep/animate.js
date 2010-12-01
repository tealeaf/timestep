"use import";

import lib.Callback;
import lib.PubSub;
import std.js as JS;
import .View;

exports = function(view, groupId) {
	
	// TODO: we have a circular import, so do the Application import on first use
	if (typeof Application == 'undefined') {
		import .Application;
	}
	
	if (!(view instanceof View)) {
		try {
			view = ViewMgr.get(view);
		} catch(e) {
			logger.error('cannot animate:', view);
			return;
		}
	}
	
	var groupId = groupId || 0,
		group = groups[groupId];
		
	if (!group) {
		group = groups[groupId] = new Group();
	}
	
	var anim = group.get(view.uid);
	if (!anim) { group.add(view.uid, (anim = new Queue(view))); }
	return anim;
}

var Group = Class(lib.PubSub, function(supr) {
	this.init = function() {
		this._anims = {};
		this._pending = [];
	}
	
	this.get = function(id) { return this._anims[id]; }

	this.add = function(id, q) {
		this._anims[id] = q;
		q.subscribe('Finish', this, 'onAnimationFinish');
	}
	
	this.isRunning = function() {
		for (var id in this._anims) {
			if (this._anims[id]._isRunning) { return true; }
		}
		return false;
	}
	
	this.onAnimationFinish = function() {
		if (this.isRunning()) { return; }
		
		// if called from a Finish event, republish it
		this.publish('Finish');
		
		this.checkPending();
	}
	
	this.checkPending = function() {
		while (true) {
			var isRunning = this.isRunning();
			if (isRunning) { return false; }
			
			if (this._pending[0]) {
				var f = this._pending.shift();
				f();
			} else {
				return true; // not running an animation and nothing pending
			}
		}
	}
	
	this.schedule = function(f) {
		if (this.checkPending()) {
			f();
		} else {
			this._pending.push(f);
		}
	}
});

exports.schedule = function(f, groupId) { exports.getGroup(groupId).schedule(f); }

var groups = {
	0: new Group()
};

exports.getGroup = function(i) {
	return groups[i || 0];
}

var Point = Class(function() {
	this.init = function(target, duration, transition) {
		this.target = JS.shallowCopy(target);
		this.duration = duration || 500;
		this.transition = transition || exports.easeInOut;
	}
});

var Runnable = Class(function() {
	this.init = function(exec, duration, transition) {
		this.exec = exec;
		this.duration = duration || 0;
		this.transition = transition || exports.easeInOut;
	}
});

var Queue = exports.Queue = Class(lib.PubSub, function() {
	this.init = function(view) {
		this.view = view;
		this.clear();
	}
	
	this.getQueue = function() { return this._queue; }
	
	this.clear = function() {
		this._elapsed = 0;
		this._queue = [];
		return this;
	}
	
	this.start = function() { this._elapsed = 0; this.resume(); }
	this.resume = function() {
		if (this._isRunning) { return; }
		this._isRunning = true;
		Application.get().subscribe('tick', this, 'onTick');
	}
	
	this.stop = function() {
		this._isRunning = false;
		Application.get().unsubscribe('tick', this, 'onTick');
	}
	
	this.wait = function(duration) {
		this._queue.push(new Point({}, duration));
		this.resume();
		return this;
	}
	
	this.now = function(style, duration, transition) {
		transition = transition || (this._isRunning ? exports.easeOut : exports.easeInOut);
		var savedStyle = this.view.getStyle(),
			newStyle = JS.shallowCopy(style);
		this.commit();
		this.resolveDeltas(newStyle, this.view.style);
		this.view.setStyle(savedStyle);
		this.then(newStyle, duration, transition);
	}
	
	this.then = function(style, duration, transition) {
		if (typeof style == 'function') {
			this._queue.push(new Runnable(style, duration, transition));
		} else {
			this._queue.push(new Point(style, duration, transition));
		}
		this.resume();
		return this;
	}

	this.debug = function() { this._debug = true; }
	
	this.resolveDeltas = function(style, againstStyle) {
		var resolvedStyle = againstStyle || this._baseStyle;
		for (var key in style) {
			var r = key.substring(1);
			if (key.charAt(0) == 'd' && !(key in resolvedStyle) && (r in resolvedStyle)) {
				style[r] = style[key] + resolvedStyle[r];
				delete style[key];
			}
		}
	}
	
	this.resolveStyle = function(prevTarget) {
		var s = this._baseStyle;
		for (var i in s) {
			s[i] = i in prevTarget ? prevTarget[i] : s[i];
		}
	}
	
	this.copyBaseStyle = function() { this._baseStyle = JS.shallowCopy(this.view.style); }
	
	this.commit = function() {
		this._elapsed = 0;
		for (var i = 0, p; p = this._queue[i]; ++i) {
			this._elapsed += p.duration;
		}
		
		this.next();
		return this;
	}
	
	this.onTick = function(dt) {
		this._elapsed += dt;
		this.next();
	}
	
	this.next = function() {
		var p,
			target;
		
		if (!this._queue[0]) { return; }
		
		while ((p = this._queue[0])) {
			this.view.needsRepaint();
			
			var isRunnable = p instanceof Runnable;
			
			if (!p._resolved) {
				this.copyBaseStyle();
				p._resolved = true;
			}
			
			if (!isRunnable) {
				target = p.target;
				
				if (!p._checkedDeltas) {
					this.resolveDeltas(target);
					p._checkedDeltas = true;
				}
			}

			var isFinished = this._elapsed >= p.duration,
				t = isFinished ? 1 : this._elapsed / p.duration,
				tt = p.transition(t);
				
			if (isRunnable) {
				p.exec.call(this.view, tt, t, this._baseStyle);
			} else {
				this._set(target, tt);
			}

			if (!isFinished) {
				return; // wait for next tick
			}
			
			this._queue.shift();
			this._elapsed -= p.duration;
		}
		
		this.stop();
		this.publish('Finish');
	}
	
	this._set = function(newStyle, t) {
		var oldStyle = this._baseStyle;
		for (var key in newStyle) {
			if (key in oldStyle) {
				this.view.style[key] = (newStyle[key] - oldStyle[key]) * t + oldStyle[key];
			}
		}
		if (this._debug) {
			var changed = {};
			for (var key in newStyle) {
				changed[key] = this.view.style[key] + ' -> ' + newStyle[key];
			}
			logger.log(t, JSON.stringify(changed));
		}
	}
});

exports.linear = function (n) { return n; }
exports.easeIn = function (n) { return n * n; }
exports.easeInOut = function (n) { return (n *= 2) < 1 ? 0.5 * n * n * n : 0.5 * ((n -= 2) * n * n + 2); }
exports.easeOut = function(n) { return n * (2 - n); }
