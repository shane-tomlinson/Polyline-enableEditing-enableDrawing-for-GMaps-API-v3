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
