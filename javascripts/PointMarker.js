/**
* An marker marking a point on the map
* @class google.mapsextensions.PointMarker
* @extends google.maps.OverlayView
* @constructor 
* @param {object} opts - configuration options.
*/
google.mapsextensions.PointMarker = function( opts ) {
	__extend(this, opts);
	
	this.target = null;
	
	this.setMap( this.map );
}
google.mapsextensions.PointMarker.prototype = new google.maps.OverlayView();

__extend( google.mapsextensions.PointMarker.prototype, {
	onAdd: function() {
		var div = document.createElement( 'DIV' );
		
		$( div ).css( {
			border: '1px solid ' + this.color,
			display: this.visible ? 'block' : 'none',
			position: 'absolute',
			'background-color': '#ffffff',
			'width': '9px',
			'height': '9px',
			'z-index': 1,
			'cursor': 'pointer'
		} );
		
		
		this.target = div;
		
		var panes = this.getPanes();
		panes.overlayLayer.appendChild( div );
		
		$( div ).bind( 'mousedown', __bind( this.onMouseDown, this ) )
				.bind( 'mouseup', __bind( this.onMouseUp, this ) )
				.bind( 'mousemove', __bind( this.onMouseMove, this ) )
				.bind( 'click', __bind( this.onClick, this ) );
	},
	
	draw: function() {
		this.setPosition( this.position );
	},
	
	setPosition: function( latLng ) {
		this.position = latLng;
		var overlayProjection = this.getProjection();
		var centerPos = overlayProjection.fromLatLngToDivPixel( latLng );
		
		this.target.style.left = ( centerPos.x - 5 ) + 'px';
		this.target.style.top = ( centerPos.y - 5 ) + 'px';
	},
	
	onRemove: function() {
		this.target.parentNode.removeChild( this.target );
		this.target = null;
	},
	
	onMouseDown: function( event ) {
		event.stopPropagation();

		var latLng = this.getEventLatLng( event );
		google.maps.event.trigger( this, 'mousedown', latLng );	
		
		if( this.draggable ) {
			google.maps.event.trigger( this, 'dragstart', latLng );	
			
			this.mouseMoveOverMapListner = __bind( this.onMouseMoveOverMap, this );
			$( this.getMap().getDiv() ).bind( 'mousemove', this.mouseMoveOverMapListner );
			
			this.mouseUpOverMapListner = __bind( this.onMouseUpOverMap, this );
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
		$(this.target)[visible ? "show" : "hide"]();
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
	}
	
} );

