
(function(angular) {

'use strict';

angular.module("ed.wms", ["ed.maputils"])


.directive("edWmsButton", ['$rootScope', '$timeout', 'flashService', 'edWmsService', function($rootScope, $timeout, flashService, edWmsService) {
	return {
		scope : {
			data : "="
		},
      restrict: 'AE',
		templateUrl: 'download/wms/wmsbutton.html',
		link : function(scope) {
			$rootScope.$on('hide.wms', function(event, id) {
				if(scope.data && id == scope.data.sysId && scope.data.isWmsShowing) {
					scope.toggle();
				}
			});

			scope.toggle = function() {
				if(scope.data.isWmsShowing) {
					edWmsService.hide(scope.data);
				} else {
					edWmsService.show(scope.data);
				}
			};

			// In an ng-repeat this gets called
			scope.$on("$destroy", function() {
				edWmsService.hide(scope.data);
			});
		}
	};
}])

.factory("edWmsService", ['$http', '$log', '$q', '$timeout', 'edMapUtilsService',
                        function($http, $log, $q, $timeout, edMapUtilsService) {
	return {
		show : function(data) {
         if(!data.layer) {
            data.layer = createLayer(data.services.wms);
         }
			data.isWmsShowing = true;
			edMapUtilsService.showLayer(data.layer);
		},

		hide : function(data) {
         if(!data.layer) {
            return;
         }
			data.isWmsShowing = false;
			edMapUtilsService.hideLayer(data.layer);
		}
	};

	function createLayer(service) {
		var rawUrl;

		if(service.url.indexOf("?") > -1) {
			rawUrl = service.url.substr(0, service.url.indexOf("?"));
		} else {
			rawUrl = service.url;
		}

		return edMapUtilsService.createWmsLayer(rawUrl, service.layerNames);
	}
}]);

})(angular);
