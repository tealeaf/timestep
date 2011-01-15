
var Font = exports = Class(function(){
	this.init = function(){
	};
	
	this.resolveAgainst = function(fonts){
		var fontsStr = this.family.toLowerCase();

		if (fontsStr in fonts) {
			var style = {};
			var fontMap = fonts[fontsStr];
			
			if (/bold/i.test(this.weight)) { style.bold = true };
			if (/(italic|oblique)/i.test(this.style)) { style.italic = true };
			if (style.bold && style.italic) { style.bolditalic = true };

			if (style.bolditalic) { return fontMap.bolditalic || fontMap.bold || fontmap.italic || this.family };
			if (style.bold) { return fontMap.bold || fontMap.bolditalic || this.family };
			if (style.italic) { return fontMap.italic || fontMap.bolditalic || this.family };
			return this.family;
		}
		return "helvetica";
	}
});


var cache = {};

var weights = 'normal|bold|bolder|lighter|[1-9]00'
  , styles = 'normal|italic|oblique'
  , units = 'px|pt|pc|in|cm|mm|%'
  , string = '\'([^\']+)\'|"([^"]+)"|[\\w-]+';

/**
 * Font parser RegExp;
 */

var fontre = new RegExp('^ *'
  + '(?:(' + weights + ') *)?'
  + '(?:(' + styles + ') *)?'
  + '([\\d\\.]+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)'
  );

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

var parse = exports.parse = function(str) {
//	logger.log("Font.parse");
	var captures = fontre.exec(str);

  // Invalid
  if (!captures) return;

  // Cached
  if (cache[str]) return cache[str];

  // Populate font object
	var font = new Font();
  font.weight = captures[1] || 'normal';
  font.style = captures[2] || 'normal';
  font.size = parseFloat(captures[3]);
  font.unit = captures[4];
  font.family = captures[5].replace(/["']/g, '');

  // TODO: dpi
  // TODO: remaining unit conversion
  switch (font.unit) {
    case 'px':
      font.size *= 4/3;
      break;
    case 'in':
      font.size *= (4/3) * 96;
      break;
    case 'mm':
      font.size *= (4/3) * 96.0 / 25.4;
      break;
    case 'cm':
      font.size *= (4/3) * 96.0 / 2.54;
      break;
  }
  return cache[str] = font;
};
