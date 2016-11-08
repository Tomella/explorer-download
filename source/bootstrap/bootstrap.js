(function (angular) {
	'use strict';

	angular.module("ed.download", [
      'ed.bbox',
      'ed.clip',
      'ed.config',
      'ed.dataset',
      'ed.downloader',
      'ed.email',
      'ed.formats',
      'ed.maputils',
      'ed.panel',
      'ed.templates',
      'ed.wms',

      'geo.draw'
   ])

	.run(['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout) {
      console.log("Explorer download signing in now.");
	}]);

})(angular);