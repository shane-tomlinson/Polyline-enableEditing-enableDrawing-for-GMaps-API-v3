/**
* The purpose of this is to add enableDrawing, enableEditing, and disableEditing to a GMap API v3
*	Polyline and Polygon.  Right now it is only applied to a Polyline.  To use this,
*	instead of doing "new google.maps.Polyline", do "new google.mapsextensions.Polyline" with the
*	same interface.  The new polyline has enableDrawing, enableEditing, and disableEditing with the
*	same options as v2 of the API.
*/

function __extend(addTo, extension) {
	for( var key in extension ) {
		addTo[ key ] = extension[ key ];
	}
}

function __bind( func, context ) {
	var call = func, context = context;
	return function() {
		return call.apply( context, arguments );
	}

}

google.mapsextensions = {};
/**
* A polyline with enableDrawing, enableEditing, and disableEditing.
*
* @class google.mapsextensions.Polyline
* @extends google.maps.Polyline
* @constructor
*/
google.mapsextensions.Polyline = function() {
	google.maps.Polyline.apply( this, arguments );

	this.initPathWithMarkers();
};
google.mapsextensions.Polyline.prototype = new google.maps.Polyline();

__extend( google.mapsextensions.Polyline.prototype, {
	enableDrawing: function( opts ) {
		// maxVertices, fromStart
		opts = opts || {},
		opts.fromStart = opts.fromStart || false;
		opts.maxVerticies = 'number' == typeof ( opts.maxVertices ) ? opts.maxVerticies : Infinity;
		this.drawingOpts = opts;
		
		this.mapClickHandler = google.maps.event.addListener( this.getMap(), 'click', __bind( this.onMapClick, this ) );
	},
	
	enableEditing: function( opts ) {
		this.pathWithMarkers.setEditable( true );
		this.setPolylineEditable( true );
		
		this.polylineMouseDownHandler = google.maps.event.addListener( this, 'mousedown', __bind( this.onPolylineMouseDown, this ) );
	},

	disableEditing: function( opts ) {
		this.editingEnabled = false;
		this.pathWithMarkers.setEditable( false );
		this.setPolylineEditable( false );
		
		if( this.polylineMouseDownHandler ) {
			google.maps.event.removeListener( this.polylineMouseDownHandler );
			this.polylineMouseDownHandler = null;
		}
		
		if( this.mapClickHandler ) {
			google.maps.event.removeListener( this.mapClickHandler );
			this.mapClickHandler = null;
		}
		
	},

	onPolylineMouseDown: function( event ) {
		var latLng = event.latLng;
		var segment = this.pathWithMarkers.getIndexOfSegmentContainingPoint( latLng );
		if( segment > -1 ) {
			var index = segment + 1;	// if we are adding to segment 0, then the added point is point 1.
			this.addPoint( latLng, index );
			this.addPointFromPolyline = true;
		}
	},
	
	onMapClick: function( event ) {
		if( !this.addPointFromPolyline ) {
			var path = this.getPath();
			var index = this.drawingOpts.fromStart ? 0 : path.length;
			this.addPoint( event.latLng, index );
		}
		
		this.addPointFromPolyline = false;
	},
	
	addPoint: function( latLng, index ) {
		var path = this.getPath();
		if( path.length < this.drawingOpts.maxVerticies ) {
			this.pathWithMarkers.insertAt( index, latLng );
		}
	},

	initPathWithMarkers: function() {
		this.pathWithMarkers = new google.mapsextensions.PathWithMarkers( {
			path: this.getPath(),
			map: this.getMap()
		} );
	},
	
	setPolylineEditable: function( editable ) {
		this.setOptions( { 
			clickable: editable
		} );
	},
	
	setMap: function( map ) {
		this.pathWithMarkers.setMap( map );
		
		google.maps.Polyline.prototype.setMap.apply( this, arguments );
	}

} );

/**
* A path with markers that can be dragged.  Adding points to this using insertAt
*	will create a point on the path as well as add a marker to the map.
*
* @class google.mapsextensions.PathWithMarkers
*/
/**
* The path to add points to
* @config path
* @type {object}
*/
/**
* The map the path is located on
* @config map
* @type {object} (optional)
*/
google.mapsextensions.PathWithMarkers = function( opts ) {
	this.path = opts.path;
	this.map = opts.map;
	
	this.initMarkerCollection();
};

__extend( google.mapsextensions.PathWithMarkers.prototype, {
	initMarkerCollection: function() {
		if( !this.markerCollection ) {
			this.markerCollection = new google.mapsextensions.MarkersCollection();
		}
	},

	/**
	* insert a new point into the path, makes a marker for the point
	* @method insertAt
	* @param {number} index - index where to place point
	* @param {object} latLng - latitude and longitude of the point
	*/
	insertAt: function( index, latLng ) {
		this.path.insertAt( index, latLng );

		var marker = this.createMarker( index, latLng );
		this.markerCollection.addMarker( marker, index );
	},
	
	createMarker: function( index, latLng ) {
		var marker = new google.maps.Marker( {
			position: latLng,
			map: this.map,
			path: this.path,
			draggable: !!this.editingEnabled
		} );
		
		google.maps.event.addListener( marker, 'dragend', __bind( function( event ) {
			this.onMarkerDragEnd( marker );
		}, this ) );
		
		return marker;
	},
	
	onMarkerDragEnd: function( marker ) {
		var index = this.markerCollection.getIndex( marker );
		if( index > -1 ) {
			this.path.setAt( index, marker.getPosition() );
		}
	},
	
	/**
	* set the path editable
	* @method setEditable
	* @param {bool} editable - whether path is editable or not
	*/
	setEditable: function( editable ) {
		this.editingEnabled = !!editable;
		this.markerCollection.setEditable( editable );
	},

	/**
	* set the map of the path
	* @method setMap
	* @param {object} map - map where the path is located
	*/
	setMap: function( map ) {
		this.map = map;
	},
	
	/**
	* gets a line segment on the path.  a segment is a line between two points.
	*	segment 0 would be the segment between points 0 and 1, segment 1 would be
	*	the segment between points 1 and 2.
	* @method getSegment
	* @param {number} index - index of the segment to get
	* @returns {object} segment if available, undefined otw.
	*/
	getSegment: function( index ) {
		var startPoint = this.path.getAt( index );
		var endPoint = this.path.getAt( index + 1 );
		
		var segment;
		if( startPoint && endPoint ) {
			segment = new google.mapsextensions.Segment( {
				startPoint: startPoint,
				endPoint: endPoint
			} );
		}
		
		return segment;
	},
	
	/**
	* gets the index of the segment containing the specified point.
	* @method getIndexOfSegmentContainingPoint
	* @param {LatLng} latLng - latLng to search for
	* @returns {number} index of segment if available, -1 otherwise.
	*/
	getIndexOfSegmentContainingPoint: function( latLng ) {
		for( var index = 0, segment; segment = this.getSegment( index ); ++index ) {
			if( segment.containsPoint( latLng ) ) {
				return index;
			}
		}
		return -1;
	}
	
} );


/**
* A collection of google.maps.Markers
* @class google.mapsextensions.MarkersCollection
* @extends google.maps.MVCArray
* @constructor
* @param {object} opts - options
*/
google.mapsextensions.MarkersCollection = function( opts ) {
	google.maps.MVCArray.apply( this, arguments );
}
google.mapsextensions.MarkersCollection.prototype = new google.maps.MVCArray();
__extend( google.mapsextensions.MarkersCollection.prototype, {
	getIndex: function( marker ) {
		for ( var index = 0, len = this.getLength(); index < len; ++index ) {
			if( this.getAt( index ) == marker ) {
				return index;
			}
		}
		
		return -1;
	},
	
	addMarker: function( marker, index ) {
		this.insertAt( index || 0, marker );
	},
	
	removeMarker: function( marker ) {
		var index = this.getIndex( marker );
		if( index > -1 ) {
			this.removeAt( index );
		}
	
	},
	
	setEditable: function( editable ) {
		for( var index = 0, marker; marker = this.getAt( index ); ++index ) {
			marker.setDraggable( !!editable );
		}
	}
} );

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
	this.startPoint = opts.startPoint;
	this.endPoint = opts.endPoint;
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