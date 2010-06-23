/**
* The purpose of this is to add enableDrawing, enableEditing, and disableEditing to a GMap API v3
*	Polyline and Polygon.  Right now it is only applied to a Polyline.  To use this,
*	instead of doing "new google.maps.Polyline", do "new google.mapsextensions.Polyline" with the
*	same interface.  The new polyline has enableDrawing, enableEditing, and disableEditing with the
*	same options as v2 of the API.
*/

function extend(addTo, extension) {
	for( var key in extension ) {
		addTo[ key ] = extension[ key ];
	}
	return addTo;
}

function bind( func, context ) {
	return function() {
		return func.apply( context, arguments );
	};
}

google.mapsextensions = {};
