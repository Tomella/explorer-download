(function (angular) {
   'use strict';

   angular.module("ed.config", [])

      .provider('edConfigService', [function () {
         var location = "app/bower_components/explorer-download/dist/download.json";

         this.setLocation = function (newLocation) {
            location = newLocation;
         };

         this.$get = ["$http", function factory($http) {
            return new DownloadConfig(location, $http);
         }];
      }]);

   class DownloadConfig {

      constructor(url, $http) {
         this.$http = $http;
         this.location = url;
      }

      child(name) {
         return this.config.then(data => data[name]);
      }

      get initiateServiceTemplates() {
         return child('initiateServiceTemplates');
      }

      get processingTemplates() {
         return child('processing');
      }

      get outputFormat() {
         return child('outFormat');
      }

      get outputCoordinateSystem() {
         return child('outCoordSys');
      }

      get datasets() {
         return child('datasets');
      }

      get config() {
         return this.$http.get(this.location, {cache: true}).then(response => response.data);
      }
   }
})(angular);