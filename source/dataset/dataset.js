
(function(angular) {

'use strict';

angular.module("ed.dataset", [])

.directive("edDataset", [function() {
	return {
		templateUrl : "download/dataset/dataset.html",
      scope: {
         dataset: "="
      },
      controller: "selectCtrl",
      controllerAs: "select",
		link: function(scope, element, attrs) {
			console.log("What's up doc!");
		}
	};
}])


/**
 * Format the publication date
 */
.filter("pubDate", function() {
	return function(string) {
		var date;
		if(string) {
			date = new Date(string);
			return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
		}
		return "-";
	};
})

/**
 * Format the array of authors
 */
.filter("authors", function() {
	return function(auth) {
		if(auth) {
			return auth.join(", ");
		}
		return "-";
	};
})

/**
 * If the text is larger than a certain size truncate it and add some dots to the end.
 */
.filter("truncate", function() {
	return function(text, length) {
		if(text && text.length > length - 3) {
			return text.substr(0, length -3) + "...";
		}
		return text;
	};
})
.controller("selectCtrl", SelectCtrl);

function SelectCtrl() {
   console.log("9999999999999999999999999999999");
}


})(angular);
