/**
 * This is the only component that knows about leaflet.
 */


(function(angular, L) {

'use strict';

angular.module("ed.maputils", [])

.factory("edMapUtilsService", ['mapService', function(mapService) {
	const normalLayerColor = "#ff7800",
		hilightLayerColor = 'darkblue';

   var service = {};

   service.createGroup = function() {
      return mapService.getMap().then(map => {
			var layer = L.layerGroup();
			map.addLayer(layer);
			return layer;
      });
   };

   service.removeGroup = function(group) {
      mapService.getMap().then(map => {
			map.removeLayer(group);
      });
   };

   service.createWmsLayer = function(url, layers) {
      return L.tileLayer.wms(url, {
			layers:layers,
      	format : "image/png",
			transparent:true
		});
   };

   service.showLayer = function(layer, zoom) {
      mapService.getMap().then(map => {
			layer.addTo(map);
         if(zoom) {
            map.fitBounds(layer.getBounds());
         }
		});
   };

   service.hideLayer = function(layer) {
      mapService.getMap().then(map => {
			map.removeLayer(layer);
		});
   };

   service.createBounds = function(bounds, config = {fill: false, color: normalLayerColor, weight: 2, opacity: 0.8}) {
		// create a rectangle
		return L.rectangle(bounds, config);
   };

   service.bboxToBounds = function(bbox) {
      // "113.760230 -45.949852 162.000033 -9.205568"
      var parts = bbox.split(" ");

      return [[+parts[3], +parts[0]], [+parts[1], +parts[2]]];
   };

	return service;
}]);

})(angular, L);
