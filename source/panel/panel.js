(function (angular) {
	'use strict';

	angular.module("ed.panel", [])

   .directive('edPanel', ['edConfigService', function(edConfigService) {
      return {
         templateUrl: "download/panel/panel.html",
         link: function(scope) {
            edConfigService.config.then(config => {
               scope.config = config;
               console.log(config);
            });
         }
      };
   }]);

})(angular);