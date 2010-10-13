jsio('import .View');
jsio('import .animate');

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);
		this.stack = [];
	}
	
	this.getCurrentView = function() {
		if (!this.stack.length) { return null; }
		return this.stack[this.stack.length - 1];
	}
	
	this.push = function(view, dontAnimate) {
		var current = this.getCurrentView();
		if (current) { this._hide(current, dontAnimate); }
		view.style.width = this.style.width;
		view.style.height = this.style.height;
		this.stack.push(view);
		this._show(view, dontAnimate);
	}
	
	this._hide = function(view, dontAnimate) {
		view.publish('ViewWillDisappear');
		if (!dontAnimate) {
			animate(view)
				.then({x: -view.style.width})
				.subscribe('Finish', this, 'removeSubview', view);
		} else {
			this.removeSubview(view);
		}
		
		view.publish('ViewDidDisappear');
	}
	
	this._show = function(view, dontAnimate) {
		view.publish('ViewWillAppear');
		if (!dontAnimate) {
			view.style.x = this.style.width;
			this.addSubview(view);
			animate(view)
				.then({x: 0})
		} else {
			this.addSubview(view);
		}
		
		view.publish('ViewDidAppear');
	}
	
	this.pop = function(dontAnimate) {
		if (!this.stack.length) { return false; }
		
		var view = this.stack.pop();
		this.hide(view, dontAnimate);
		
		if (this.stack.length) {
			this.show(this.stack[this.stack.length - 1], dontAnimate);
		}
		
		return view;
	}
});