/**
* An marker marking a point on the map
* @class google.mapsextensions.PointMarker
* @extends google.maps.OverlayView
* @constructor 
* @param {object} opts - configuration options.
*/
google.mapsextensions.PointMarker = function( opts ) {
	extend(this, opts);
	
	this.target = null;
	
	this.setMap( this.map );
}
google.mapsextensions.PointMarker.prototype = new google.maps.OverlayView();

extend( google.mapsextensions.PointMarker.prototype, {
	onAdd: function() {
		var div = document.createElement( 'DIV' );
		
		this.target = $( div );
		this.target.css( {
			border: '1px solid ' + this.color,
			display: this.visible ? 'block' : 'none',
			position: 'absolute',
			'background-color': '#ffffff',
			'width': '9px',
			'height': '9px',
			'z-index': 1,
			'cursor': 'pointer'
		} );
		
		var panes = this.getPanes();
		panes.overlayLayer.appendChild( div );
		
		this.target.bind( 'mousedown', bind( this.onMouseDown, this ) )
				.bind( 'mouseup', bind( this.onMouseUp, this ) )
				.bind( 'mousemove', bind( this.onMouseMove, this ) )
				.bind( 'click', bind( this.onClick, this ) );
	},
	
	draw: function() {
		this.setPosition( this.position );
	},
	
	setPosition: function( latLng ) {
		this.position = latLng;
		var overlayProjection = this.getProjection();
		var centerPos = overlayProjection.fromLatLngToDivPixel( latLng );
		
		this.target.css( {
			left: ( centerPos.x - 5 ) + 'px',
			top: ( centerPos.y - 5 ) + 'px'
		} );
	},
	
	onRemove: function() {
		this.target.remove();
		this.target = null;
	},
	
	onMouseDown: function( event ) {
		event.stopPropagation();

		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'mousedown', latLng );	
		
		if( this.draggable ) {
			google.maps.event.trigger( this, 'dragstart', latLng );	
			
			this.mouseMoveOverMapListner = bind( this.onMouseMoveOverMap, this );
			$( this.getMap().getDiv() ).bind( 'mousemove', this.mouseMoveOverMapListner );
			
			this.mouseUpOverMapListner = bind( this.onMouseUpOverMap, this );
			$( this.getMap().getDiv() ).bind( 'mouseup', this.mouseUpOverMapListner );

			this.dragging = true;
		}
	},
	
	onMouseUp: function( event ) {
		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'mouseup', latLng );	
	},
	
	onMouseMove: function( event ) {
		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'mousemove', latLng );	
	},
	
	onClick: function( event ) {
		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'click', latLng );
	},

	onMouseUpOverMap: function( event ) {
		if( this.draggable && this.dragging ) {
			var latLng = this.getEventLatLng( event );
			google.maps.event.trigger( this, 'dragend', latLng );
			
			$( this.getMap().getDiv() ).unbind( 'mousemove', this.mouseMoveOverMapListner );
			this.mouseMoveOverMapListner = null;
			
			$( this.getMap().getDiv() ).unbind( 'mouseup', this.mouseUpOverMapListner );
			this.mouseUpOverMapListner = null;

			this.dragging = false;
		}
	},
	
	onMouseMoveOverMap: function( event ) {
		if( this.draggable && this.dragging ) {
			var latLng = this.getEventLatLng( event );

			this.setPosition( latLng );
			google.maps.event.trigger( this, 'drag', latLng );
		}
	},
	
	
	setDraggable: function( draggable ) {
		this.draggable = !!draggable;
	},
	
	setVisible: function( visible ) {
		this.visible = !!visible;
		this.target[ visible ? "show" : "hide" ]();
	},
	
	getPosition: function() {
		return this.position;
	},
	
	getEventLatLng: function( event ) {
		var eventPoint = this.getEventPoint( event );
		
		var overlayProjection = this.getProjection();		
		var latLng = overlayProjection.fromContainerPixelToLatLng( eventPoint );
		return latLng;
	},
	
	getEventPoint: function( event ) {
		var mapDiv = this.getMap().getDiv();
		var offset = $( mapDiv ).offset();
		
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top;
		
		var point = new google.maps.Point( x, y );
		return point;
	},
	
	/**
	* set options on the marker
	* @method setOptions
	* @param {object} opts - options to set.  Right now only supports color
	*/
	setOptions: function( opts ) {
		if( opts.color ) {
			this.setColor( opts.color );
		}
	},
	
	/**
	* set the marker color
	* @method setColor
	* @param {string} color - new marker color
	*/
	setColor: function( color ) {
		this.target.css( {
			borderColor: color
		} );
	}
	
} );

