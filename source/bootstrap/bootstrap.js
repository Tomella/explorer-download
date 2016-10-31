(function (angular) {
	'use strict';

	angular.module("explorer.download", ['explorer.download.panel'])

	.run(['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
      console.log("Explorer download signing in now.");
	}]);

})(angular);