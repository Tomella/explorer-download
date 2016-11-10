
(function(angular) {

'use strict';

angular.module("ed.clip", [])

.directive('edClip', ['edClipService', function(edClipService) {
   return {
      templateUrl: "download/clip/clip.html",
      scope: {
         processing: "=",
         drawn: "&"
      },
      link: function(scope) {
         scope.initiateDraw = function() {
				edClipService.initiateDraw().then(drawComplete);

				function drawComplete(data) {
					var c = scope.processing.clip;
					var response;

					c.xMax = +data.clip.xMax;
					c.xMin = +data.clip.xMin;
					c.yMax = +data.clip.yMax;
					c.yMin = +data.clip.yMin;
					if(scope.drawn) {
						response = scope.drawn();
						if(response && response.code && response.code === "oversize") {
							scope.initiateDraw();
						}
					}
				}
         };
      }
   };
}])

.factory("edClipService", ['drawService', function(drawService) {
	return {
		initiateDraw : function() {
			return drawService.drawRectangle().then(drawComplete);
		},

		cancelDraw : function() {
			drawService.cancelDrawRectangle();
		}
	};

	function drawComplete(data) {
		return {clip:{
			xMax: data.bounds.getEast().toFixed(5),
			xMin: data.bounds.getWest().toFixed(5),
			yMax: data.bounds.getNorth().toFixed(5),
			yMin: data.bounds.getSouth().toFixed(5)
		}};
	}
}]);

})(angular);