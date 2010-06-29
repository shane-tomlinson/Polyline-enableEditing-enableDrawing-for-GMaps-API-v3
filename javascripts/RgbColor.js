/**
* Represents RGB color.
*
* HSL-RGB conversion adapted from:
* http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
*
* @class google.mapsextensions.RgbColor
* @constructor
*/
google.mapsextensions.RgbColor = function( color ) {
	this.color = this.toArray(color);
};

extend( google.mapsextensions.RgbColor.prototype, {
	predefined: {
		"black": "#000000",
		"green": "#008000",
		"silver": "#c0c0c0",
		"lime": "#00ff00",
		"gray": "#808080",
		"olive": "#808000",
		"white": "#ffffff",
		"yellow": "#ffff00",
		"maroon": "#800000",
		"navy": "#000080",
		"red": "#ff0000",
		"blue": "#0000ff",
		"purple": "#800080",
		"teal": "#008080",
		"fuchsia": "#ff00ff",
		"aqua": "#00ffff"
	},
	
	toArray: function( color ) {
		var m;
		if ( color instanceof Array ) {
			return color;
		}
		// try #rgb
		else if (( m = color.match(/^ *#([0-9A-F])([0-9A-F])([0-9A-F]) *$/i) )) {
			return [
				parseInt(m[1] + m[1], 16),
				parseInt(m[2] + m[2], 16),
				parseInt(m[3] + m[3], 16)
			];
		}
		// try #rrggbb
		else if (( m = color.match(/^ *#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2}) *$/i) )) {
			return [
				parseInt(m[1], 16),
				parseInt(m[2], 16),
				parseInt(m[3], 16)
			];
		}
		// try rgb(R, G, B)
		else if (( m = color.match(/^ *rgb\( *([0-9]+) *, *([0-9]+) *, *([0-9]+) *\) *$/i) )) {
			return [
				parseInt(m[1], 10),
				parseInt(m[2], 10),
				parseInt(m[3], 10)
			];
		}
		// try predefined colors
		else if ( this.predefined[color] ) {
			return this.toArray(this.predefined[color]);
		}
		// Unrecognized format. default to black
		else {
			return [0, 0, 0];
		}
	},
	
	toString: function() {
		var r = Math.min(255, Math.round(this.color[0]));
		var g = Math.min(255, Math.round(this.color[1]));
		var b = Math.min(255, Math.round(this.color[2]));
		return "rgb(" + r + ", " + g + ", " + b + ")";
	},
	
	/**
	* Converts the color to HslColor object.
	*/
	toHsl: function() {
		var r = this.color[0] / 255;
		var g = this.color[1] / 255;
		var b = this.color[2] / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;
		
		if ( max == min ) {
			h = s = 0; // achromatic
		}
		else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch ( max ) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		
		return new google.mapsextensions.HslColor([h, s, l]);
	}
} );

