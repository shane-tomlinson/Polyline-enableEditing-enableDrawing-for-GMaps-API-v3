/**
* A polyline with enableDrawing, enableEditing, and disableEditing.
*
* @class google.mapsextensions.Polyline
* @extends google.maps.Polyline
* @constructor
*/
google.mapsextensions.Polyline = function( opts ) {
	this.color = opts.strokeColor;
	this.opts = opts;
	
	this.drawingOpts = { 
		fromStart: false,
		maxVerticies: Infinity
	};
	
	google.maps.Polyline.apply( this, arguments );

	this.initPathWithMarkers();
};
google.mapsextensions.Polyline.prototype = new google.maps.Polyline();

extend( google.mapsextensions.Polyline.prototype, {
	enableDrawing: function( opts ) {
		this.enableEditing( opts );
		
		this.mapClickHandler = google.maps.event.addListener( this.getMap(), 'click', bind( this.onMapClick, this ) );
		this.mapMouseMoveHandler = google.maps.event.addListener( this.getMap(), 'mousemove', bind( this.onMapMouseMove, this ) );
		
		this.showDrawingLine();
	},
	
	enableEditing: function( opts ) {
		this.setPolyEditOptions( opts );
		
		this.pathWithMarkers.setEditable( true );
		this.setPolylineEditable( true );
		
		this.polylineMouseDownHandler = google.maps.event.addListener( this, 'mousedown', bind( this.onPolylineMouseDown, this ) );
	},

	disableEditing: function() {
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
		
		if( this.mapMouseMoveHandler ) {
			google.maps.event.removeListener( this.mapMouseMoveHandler );
			this.mapMouseMoveHandler = null;
		}
		
		this.hideDrawingLine();
	},

	onPolylineMouseDown: function( event ) {	
		var latLng = event.latLng;
		var segment = this.pathWithMarkers.getIndexOfSegmentContainingPoint( latLng );
		if( segment > -1 ) {
			var index = segment + 1;	// if we are adding to segment 0, then the added point is point 1.
			this.addPoint( latLng, index );
			this.dragPoint( index );
			this.addPointFromPolyline = true;
		}
	},
	
	onMapClick: function( event ) {
		if( !this.addPointFromPolyline ) {
			var index = this.getNewLatLngIndex();
			this.addPoint( event.latLng, index );
		}
		
		this.addPointFromPolyline = false;
	},
	
	onMapDoubleClick: function( event ) {
		if( !this.addPointFromPolyline ) {
			var index = this.getNewLatLngIndex();
			this.addPoint( event.latLng, index );
			google.maps.event.trigger( this, 'cancelline' );
			this.disableEditing();
		}
		
		this.addPointFromPolyline = false;
	},
	
	onMapMouseMove: function( event ) {
		this.updateDrawingLine( this.lastLatLng, event.latLng );
	},
	
	onLineUpdated: function( event ) {
		google.maps.event.trigger( this, 'lineupdated' );
	},
	
	onEndLine: function( latLng ) {
		var index = this.getNewLatLngIndex();
		this.addPoint( latLng, index );
		
		google.maps.event.trigger( this, 'endline' );
		this.disableEditing();
	},
	
	addPoint: function( latLng, index ) {
		var path = this.getPath();
		if( path.length < this.drawingOpts.maxVerticies ) {
			this.pathWithMarkers.insertAt( index, latLng );
		}
		this.lastLatLng = latLng;
	},
	
	dragPoint: function( index ) {
		this.pathWithMarkers.dragMarker( index );
	},

	initPathWithMarkers: function() {
		this.pathWithMarkers = new google.mapsextensions.PathWithMarkers( {
			path: this.getPath(),
			map: this.getMap(),
			color: this.color
		} );
		google.maps.event.addListener( this.pathWithMarkers, 'lineupdated', bind( this.onLineUpdated, this ) );
		google.maps.event.addListener( this.pathWithMarkers, 'endline', bind( this.onEndLine, this ) );
	},
	
	setPolylineEditable: function( editable ) {
		this.setOptions( { 
			clickable: editable
		} );
	},
	
	setMap: function( map ) {
		this.pathWithMarkers.setMap( map );
		
		google.maps.Polyline.prototype.setMap.apply( this, arguments );
	},
	
	setPolyEditOptions: function( opts ) {
		extend( this.drawingOpts, opts || {} );
	},
	
	setOptions: function( opts ) {
		if( opts.strokeColor ) {
			this.pathWithMarkers.setOptions( {
				color: opts.strokeColor
			} );
		}
		
		google.maps.Polyline.prototype.setOptions.apply( this, arguments );
	},
	
	showDrawingLine: function() {
		this.createDrawingLine();
		this.drawingLine.show();
	},
	
	hideDrawingLine: function() {
		this.drawingLine.hide();
	},
	
	updateDrawingLine: function( startPoint, endPoint ) {
		if( startPoint && endPoint ) {
			this.drawingLine.updatePoints( startPoint, endPoint );
		}
	},
	
	createDrawingLine: function() {
		if( !this.drawingLine ) {
			var opts = extend( {
				map: this.getMap()
			}, this.opts );
			
			this.drawingLine = new DrawingLine( opts );
		}	
	},
	
	getNewLatLngIndex: function() {
		var index = this.drawingOpts.fromStart ? 0 : this.getPath().length;
		return index;
	}
	
	
	
} );

