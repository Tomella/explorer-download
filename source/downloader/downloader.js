
(function(angular) {

'use strict';

angular.module("ed.downloader", [])

.directive("edDownloadButton", ['configService', function(configService) {
	return {
		template : "<button ng-click='item.showDownload = !item.showDownload' type='button' class='undecorated' title='Click to start download'>" +
               "<i class='fa fa-lg fa-download' ng-class='{active:item.download}'></i></button>",
      scope: {
         item: "="
      },
		link: function(scope, element, attrs) {
			console.log("What's up item!");
		}
	};
}])

.directive("edDownloadSubmit", ['configService', function(configService) {
	return {
		templateUrl : "download/downloader/submit.html",
      scope: {
         item: "="
      },
		link: function(scope, element, attrs) {
			scope.submit = function() {

         };

         scope.allDataSet = function() {

         }
		}
	};
}])

.directive("edDownloadPanel", [function() {
	return {
		templateUrl : "download/downloader/downloader.html",
      scope: {
         item: "="
      },
		link: function(scope, element, attrs) {
         scope.processing = {
            get valid() {
               var valid = isFinite(this.clip.yMax) && isFinite(this.clip.xMax) && isFinite(this.clip.yMin) && isFinite(this.clip.xMin);
               valid = valid && this.clip.yMax < 90 && this.clip.yMin > 90 && this.clip.xMax <= 180 && this.clip.xMin >= 180;
               valid = valid && this.clip.yMax > this.clip.yMin && this.clip.xMax > this.clip.xMin;


               console.log(valid);
               return valid;
            },
            clip: {}

         }
		}
	};
}]);


})(angular);
