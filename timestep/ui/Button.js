jsio("import std.js as JS");
jsio("import ..View");

exports = Class(View, function(supr) {
	
	var defaults = {
		label: 'click here',
		width: 80,
		background: '#008',
		color: '#FFF',
		height: 40
	}
	
	this.init = function(opts) {
		opts = JS.merge(opts, defaults);
		
		supr(this, 'init', arguments);
		
		this.label = opts.label;
		this.style.color = opts.color;
		this.style.backgroundColor = opts.background;
	}
	
	this.setLabel = function(label) { this.label = label; }

	this.render = function(ctx) {
		ctx.setFillStyle(this.style.backgroundColor);
		ctx.fillRect(0, 0, this.style.width, this.style.height);
		ctx.setFillStyle(this.style.color);
		ctx.fillText(this.label, 10, 25, this.style.width - 20);
	}
});

