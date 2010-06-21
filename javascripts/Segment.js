/**
* A Segment is a line segment as defined by a startPoint and an endPoint
* @class google.mapsextensions.Segment
* @constructor
* @param {object} opts - options
*/
/**
* the start point
* @config startPoint
* @type {LatLng} 
*/
/**
* the end point
* @config endPoint
* @type {LatLng} 
*/
google.mapsextensions.Segment = function( opts ) {
	__extend(this, opts);
}

__extend( google.mapsextensions.Segment.prototype, {
	/**
	* Check if the segment contains a point
	* @method containsPoint
	* @param {LatLng} point - point to check to see if it is on the segment
	* @returns {bool} true if point is approximately on the segment, false otw.
	*/
	containsPoint: function( point ) {
		var startLatLon = new LatLon( this.startPoint.lat(), this.startPoint.lng() );
		var endLatLon = new LatLon( this.endPoint.lat(), this.endPoint.lng() );
		var pointLatLon = new LatLon( point.lat(), point.lng() );
		
		var bearingToEnd = startLatLon.bearingTo( endLatLon );
		var distanceToEnd = parseFloat( startLatLon.distanceTo( endLatLon ) );

		var bearingToPoint = startLatLon.bearingTo( pointLatLon );
		var distanceToPoint = parseFloat( startLatLon.distanceTo( pointLatLon ) );
				
		return ( ( ( bearingToEnd - 2 ) < bearingToPoint ) && ( bearingToPoint <  ( bearingToEnd + 2 ) ) && ( distanceToPoint <= distanceToEnd ) );
	}
} )

