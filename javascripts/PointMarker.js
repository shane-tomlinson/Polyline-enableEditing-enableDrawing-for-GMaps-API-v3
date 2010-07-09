/**
* An marker marking a point on the map
*
* @class google.mapsextensions.PointMarker
* @extends google.maps.OverlayView
* @constructor 
* @param {object} opts - configuration options.
*/
google.mapsextensions.PointMarker = function( opts ) {
	extend(this, opts);
	
	this.target = null;
	
	this.setMap( this.map );
};
google.mapsextensions.PointMarker.prototype = new google.maps.OverlayView();

google.mapsextensions.PointMarker.hoverFillColorCache = {};

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
				.bind( 'click', bind( this.onClick, this ) )
				.bind( 'mouseover', bind( this.onMouseOver, this ) )
				.bind( 'mouseout', bind( this.onMouseOut, this ) );
	},
	
	draw: function() {
		this.setPosition( this.position );
	},
	
	/**
	* Set the position of the marker
	* @method setPosition
	* @param {object} latLng - where to place the marker
	*/
	setPosition: function( latLng ) {
		this.position = latLng;
		if( this.target ) {
			var overlayProjection = this.getProjection();
			var centerPos = overlayProjection.fromLatLngToDivPixel( latLng );

			this.target.css( {
				left: ( centerPos.x - 5 ) + 'px',
				top: ( centerPos.y - 5 ) + 'px'
			} );
		}
	},
	
	onRemove: function() {
		if( this.target ) {
			this.target.remove();
			this.target = null;
		}
	},
	
	onMouseDown: function( event ) {
		event.stopPropagation();

		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'mousedown', latLng );	
		
		this.startDrag();
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

	onMouseOver: function( event ) {
		this.setFillColorHover();
	},
	
	onMouseOut: function( event ) {
		this.setFillColorDefault();
	},
	
	onMouseUpOverMap: function( event ) {
		this.stopDrag();
	},
	
	onMouseMoveOverMap: function( event ) {
		if( this.draggable && this.dragging ) {
			var latLng = this.getEventLatLng( event );

			this.setPosition( latLng );
			google.maps.event.trigger( this, 'drag', latLng );
		}
	},
	
	/**
	* Start dragging the marker
	* @method startDrag
	*/
	startDrag: function() {
		if( this.draggable ) {
			this.getMap().setOptions( {
				draggable: false
			} );
		
			var latLng = this.getPosition();
			google.maps.event.trigger( this, 'dragstart', latLng );	
			
			this.mouseMoveOverMapListner = bind( this.onMouseMoveOverMap, this );
			$( this.getMap().getDiv() ).bind( 'mousemove', this.mouseMoveOverMapListner );
			
			this.mouseUpOverMapListner = bind( this.onMouseUpOverMap, this );
			$( this.getMap().getDiv() ).bind( 'mouseup', this.mouseUpOverMapListner );

			this.dragging = true;
		}
	},

	/**
	* Stop dragging the marker
	* @method stopDrag
	*/
	stopDrag: function() {
		if( this.draggable && this.dragging ) {
			this.getMap().setOptions( {
				draggable: true
			} );
			
			var latLng = this.getPosition();
			google.maps.event.trigger( this, 'dragend', latLng );
			
			$( this.getMap().getDiv() ).unbind( 'mousemove', this.mouseMoveOverMapListner );
			this.mouseMoveOverMapListner = null;
			
			$( this.getMap().getDiv() ).unbind( 'mouseup', this.mouseUpOverMapListner );
			this.mouseUpOverMapListner = null;

			this.dragging = false;
		}
	},
	
	/**
	* Sets the marker draggable
	* @method setDraggable
	* @param {boolean} draggable - whether the marker is draggable or not
	*/
	setDraggable: function( draggable ) {
		draggable = !!draggable;
		
		if( this.draggable != draggable ) {
			this.draggable = !!draggable;
			google.maps.event.trigger( this, 'draggable_changed' );
		}
	},
	
	/**
	* Set whether the marker is visible
	* @method setVisible
	* @param {boolean} visible - whether the marker is visible or not
	*/
	setVisible: function( visible ) {
		this.visible = !!visible;
		if( this.target ) {
			this.target[ visible ? "show" : "hide" ]();
		}
	},
	
	/**
	* Get the markers latLng
	* @method getPosition
	* @return {object} latLng
	*/
	getPosition: function() {
		return this.position;
	},
	
	/**
	* get the latLng of the event
	* @method getEventLatLng
	* @param {object} event - the DOM to get latLng for
	* @return {object} latLng of event
	* @private
	*/
	getEventLatLng: function( event ) {
		var eventPoint = this.getEventPoint( event );
		
		var overlayProjection = this.getProjection();		
		var latLng = overlayProjection.fromContainerPixelToLatLng( eventPoint );
		return latLng;
	},
	
	/**
	* Get the x/y point of the event
	* @method getEventPoint
	* @param {object} event - the event to get the point for
	* @return {object} google.maps.Point
	* @private
	*/
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
		this.color = color;
		if( this.target ) {
			this.target.css( {
				borderColor: color
			} );
		}
	},
	
	/**
	* update the fill color with the default
	* @method setFillColorDefault
	*/
	setFillColorDefault: function() {
		this.target.css( { background: "#fff" } );
	},
	
	/**
	* update the hover fill color
	* @method setFillColorHover
	*/
	setFillColorHover: function() {
		var color = this.color;
		if( !google.mapsextensions.PointMarker.hoverFillColorCache[ color ] ) {
		   google.mapsextensions.PointMarker.hoverFillColorCache[ color ] = this.getHoverColor( color );
		}

		this.target.css( { background: google.mapsextensions.PointMarker.hoverFillColorCache[ color ] } );
	},
	
	/**
	* gets the color of the marker for when the user hovers over the marker
	* @method getHoverColor
	* @param {object} color - the color of the line
	* @return {string} color to use for the marker.
	*/
	getHoverColor: function( color ) {
		var rgb = new google.mapsextensions.RgbColor( color );
		var hsl = rgb.toHsl();
		hsl.lighten();
		return hsl.toRgb().toString();
	}
} );

