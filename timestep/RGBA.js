exports = Class(function() {
	this.init = function(rgba) {
		if (arguments.length > 2) {
			this.r = arguments[0];
			this.g = arguments[1];
			this.b = arguments[2];
			this.a = arguments.length >= 4 ? arguments[3] : 1;
		} else if (typeof rgba == 'string') {
			this.parse(rgba);
		} else if (rgba) {
			this.set(rgba);
		}
	}
	
	this.set = function(rgba) {
		this.r = rgba.r || 0;
		this.g = rgba.g || 0;
		this.b = rgba.b || 0;
		this.a = 'a' in rgba ? rgba.a : 1;
	}
	
	this.get = function() {
		return {
			r: this.r,
			g: this.g,
			b: this.b
		};
	}
	
	var parser = /rgba?\(\s*([.0-9]+)\s*,\s*([.0-9]+)\s*,\s*([.0-9]+)\s*,?\s*([.0-9]+)?\s*\)/;
	this.parse = function(str) {
		var match = str.match(parser);
		if (match) {
			this.r = parseInt(match[1]) || 0;
			this.g = parseInt(match[2]) || 0;
			this.b = parseInt(match[3]) || 0;
			if (4 in match) {
				var a = parseFloat(match[4]);
				this.a = isNaN(a) ? 1 : a;
			} else {
				this.a = 1;
			}
		}
	}
	
	this.toString = function() {
		return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
	}
});
