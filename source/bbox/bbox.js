(function(angular) {

'use strict';

angular.module("ed.bbox", ["ed.maputils"])

.directive("edBboxButton", ['edBboxService', function(edBboxService) {
   return {
      templateUrl: "download/bbox/bboxbutton.html",
      scope: {
         data: "="
      },
      link: function(scope) {
         scope.toggle = function() {
				scope.data.hasBbox = !scope.data.hasBbox;
            if(scope.data.hasBbox) {
               edBboxService.show(scope.data);
            } else {
               edBboxService.hide(scope.data);
            }
         };
      }
   };
}])

.factory("edBboxService", ['edMapUtilsService', function(edMapUtilsService) {
   var service = {};

   service.show = function(data) {
      if(!data.bounds) {
         let bounds = edMapUtilsService.bboxToBounds(data.bbox);
         data.bounds = edMapUtilsService.createBounds(bounds);
      }
      edMapUtilsService.showLayer(data.bounds, true);
   };

   service.hide = function(data) {
      if(data.bounds) {
         edMapUtilsService.hideLayer(data.bounds);
      }
   };

   return service;
}]);

})(angular);