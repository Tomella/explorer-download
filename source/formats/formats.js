
(function(angular) {

'use strict';

angular.module("ed.formats", [])

.directive("edFormats", ['edConfigService', function(edConfigService) {
	return {
		templateUrl : "download/formats/formats.html",
      scope: {
         processing: "="
      },
		link: function(scope) {
         edConfigService.config.then(config => {
            scope.config = config;
         });
			console.log("What's up doc!");
		}
	};
}])


.directive("edProjection", ['edConfigService', function(edConfigService) {
	return {
		templateUrl : "download/formats/projection.html",
      scope: {
         processing: "="
      },
		link: function(scope) {
         edConfigService.config.then(config => {
            scope.config = config;
         });
		}
	};
}])

.filter("edIntersect", function() {
	return intersecting;
});

function intersecting(collection, extent) {
	// The extent may have missing numbers so we don't restrict at that point.
	if(!extent || !angular.isNumber(extent.xMin) ||
	   	!angular.isNumber(extent.xMax) ||
		   !angular.isNumber(extent.yMin) ||
			!angular.isNumber(extent.yMax)) {
		return collection;
	}

	return collection.filter(function(item) {
		// We know these have valid numbers if it exists
		if(!item.extent) {
			return true;
		}
		// We have a restriction
		return item.extent.xMin <= extent.xMin &&
			item.extent.xMax >= extent.xMax &&
			item.extent.yMin <= extent.yMin &&
			item.extent.yMax >= extent.yMax;
	});
}

})(angular);