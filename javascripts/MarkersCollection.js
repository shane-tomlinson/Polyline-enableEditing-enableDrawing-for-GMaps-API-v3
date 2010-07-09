/**
* A collection of google.maps.Markers
* @class google.mapsextensions.MarkersCollection
* @extends google.maps.MVCArray
* @constructor
* @param {object} opts - options
*/
google.mapsextensions.MarkersCollection = function( opts ) {
	google.maps.MVCArray.apply( this, arguments );
};
google.mapsextensions.MarkersCollection.prototype = new google.maps.MVCArray();
extend( google.mapsextensions.MarkersCollection.prototype, {
	/**
	* Get the index of a marker
	* @method getIndex
	* @param {object} marker - marker to find index for
	* @return {number} index of marker if found, -1 otw.
	*/
	getIndex: function( marker ) {
		for ( var index = 0, len = this.getLength(); index < len; ++index ) {
			if( this.getAt( index ) == marker ) {
				return index;
			}
		}
		
		return -1;
	},
	
	/**
	* Add a marker to the collection
	* @method addMarker
	* @param {object} marker - marker to add
	* @param {number} index - index in path
	*/
	addMarker: function( marker, index ) {
		this.insertAt( index || 0, marker );
	},
	
	/**
	* Remove a marker from the path
	* @method removeMarker
	* @param {object} marker - marker to remove
	*/
	removeMarker: function( marker ) {
		var index = this.getIndex( marker );
		if( index > -1 ) {
			this.removeAt( index );
		}
	
	},
	
	/**
	* Set the path edtiable
	* @method setEditable
	* @param {boolean} editable - whether path is editable
	*/
	setEditable: function( editable ) {
		editable = !!editable;
		
		this.forEach( function( marker, index ) {
			marker.setDraggable( editable );
			marker.setVisible( editable );
		} );
	}
} );

