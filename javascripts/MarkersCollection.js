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
extend( google.mapsextensions.MarkersCollection.prototype, {
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
		var editable = !!editable;
		
		this.forEach( function( marker, index ) {
			marker.setDraggable( editable );
			marker.setVisible( editable );
		} );
	}
} );

