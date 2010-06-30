/**
* The line that follows the mouse around when in enable drawing mode
* @class DrawingLine
*/
function DrawingLine( opts ) {
	this.opts = opts;
}

DrawingLine.prototype = {
	/**
	* Show the line
	* @method show
	*/
	show: function() {
		this.createDrawingline();
		
		this.drawingLine.setMap( this.opts.map );
		this.drawingLine.setPath( [] );	
	},
	
	/**
	* Hide the line
	* @method show
	*/
	hide: function() {
		this.drawingLine.setMap( null );
	},
	
	/**
	* Update the line to connect two points
	* @method updatePoints
	* @param {object} startPoint - where to start from
	* @param {object} endPoint - where to end at
	*/
	updatePoints: function( startPoint, endPoint ) {
		if( startPoint && endPoint ) {
			this.drawingLine.setPath( [ startPoint, endPoint ] );
		}
	},
	
	
	createDrawingline: function() {
		if( !this.drawingLine ) {
			var options = extend( {}, this.opts );
			options = extend( options, {
				clickable: false
			} );
			this.drawingLine = new google.maps.Polyline( options );
		}
	}
};