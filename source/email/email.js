
(function(angular) {

'use strict';

angular.module("ed.email", [])

.directive('edEmail', [function() {
   return {
      templateUrl: 'download/email/email.html',
      scope: {
         processing: "="
      }
   };
}]);

})(angular);