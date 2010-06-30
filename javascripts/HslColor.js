/**
* Represents HSL color.
*
* HSL-RGB conversion adapted from:
* http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
*
* @class google.mapsextensions.HslColor
* @constructor
*/
google.mapsextensions.HslColor = function( color ) {
	this.color = color;
};

extend( google.mapsextensions.HslColor.prototype, {
	/**
	* Converts the color to RgbColor object.
	*/
	toRgb: function() {
		var h = this.color[0];
		var s = this.color[1];
		var l = this.color[2];
		var r, g, b;
		
		if ( s == 0 ) {
			r = g = b = l; // achromatic
		} else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = this.hue2rgb(p, q, h + 1/3);
			g = this.hue2rgb(p, q, h);
			b = this.hue2rgb(p, q, h - 1/3);
		}
		
		return new google.mapsextensions.RgbColor([r * 255, g * 255, b * 255]);
	},

	hue2rgb: function(p, q, t) {
		if ( t < 0 ) t += 1;
		if ( t > 1 ) t -= 1;
		if ( t < 1/6 ) return p + (q - p) * 6 * t;
		if ( t < 1/2 ) return q;
		if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
		return p;
	},
	
	/**
	* Increases the lightness by 3/4 the amount missing from maximum.
	*/
	lighten: function() {
		var lightness = this.color[2];
		this.color[2] = Math.min(1, lightness + ((1 - lightness) * 3/4));
	}
} );

