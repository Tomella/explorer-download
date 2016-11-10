/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

'use strict';

(function (angular) {
  'use strict';

  angular.module("ed.download", ['ed.bbox', 'ed.clip', 'ed.config', 'ed.dataset', 'ed.downloader', 'ed.email', 'ed.formats', 'ed.maputils', 'ed.panel', 'ed.templates', 'ed.wms', 'geo.draw']).run(['$http', '$rootScope', '$timeout', function ($http, $rootScope, $timeout) {
    console.log("Explorer download signing in now.");
  }]);
})(angular);
"use strict";

(function (angular) {

   'use strict';

   angular.module("ed.bbox", ["ed.maputils"]).directive("edBboxButton", ['edBboxService', function (edBboxService) {
      return {
         templateUrl: "download/bbox/bboxbutton.html",
         scope: {
            data: "="
         },
         link: function link(scope) {
            scope.toggle = function () {
               scope.data.hasBbox = !scope.data.hasBbox;
               if (scope.data.hasBbox) {
                  edBboxService.show(scope.data);
               } else {
                  edBboxService.hide(scope.data);
               }
            };
         }
      };
   }]).factory("edBboxService", ['edMapUtilsService', function (edMapUtilsService) {
      var service = {};

      service.show = function (data) {
         if (!data.boundsLayer) {
            var bounds = edMapUtilsService.bboxToBounds(data.bbox);
            data.boundsLayer = edMapUtilsService.createBounds(bounds);
         }
         edMapUtilsService.showLayer(data.boundsLayer, true);
      };

      service.hide = function (data) {
         if (data.boundsLayer) {
            edMapUtilsService.hideLayer(data.boundsLayer);
         }
      };

      return service;
   }]);
})(angular);
'use strict';

(function (angular) {

	'use strict';

	angular.module("ed.clip", []).directive('edClip', ['edClipService', function (edClipService) {
		return {
			templateUrl: "download/clip/clip.html",
			scope: {
				processing: "=",
				drawn: "&"
			},
			link: function link(scope) {
				scope.initiateDraw = function () {
					edClipService.initiateDraw().then(drawComplete);

					function drawComplete(data) {
						var c = scope.processing.clip;
						var response;

						c.xMax = +data.clip.xMax;
						c.xMin = +data.clip.xMin;
						c.yMax = +data.clip.yMax;
						c.yMin = +data.clip.yMin;
						if (scope.drawn) {
							response = scope.drawn();
							if (response && response.code && response.code === "oversize") {
								scope.initiateDraw();
							}
						}
					}
				};
			}
		};
	}]).factory("edClipService", ['drawService', function (drawService) {
		return {
			initiateDraw: function initiateDraw() {
				return drawService.drawRectangle().then(drawComplete);
			},

			cancelDraw: function cancelDraw() {
				drawService.cancelDrawRectangle();
			}
		};

		function drawComplete(data) {
			return { clip: {
					xMax: data.bounds.getEast().toFixed(5),
					xMin: data.bounds.getWest().toFixed(5),
					yMax: data.bounds.getNorth().toFixed(5),
					yMin: data.bounds.getSouth().toFixed(5)
				} };
		}
	}]);
})(angular);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (angular) {
   'use strict';

   angular.module("ed.config", []).provider('edConfigService', [function () {
      var location = "app/bower_components/explorer-download/dist/download.json";

      this.setLocation = function (newLocation) {
         location = newLocation;
      };

      this.$get = ["$http", function factory($http) {
         return new DownloadConfig(location, $http);
      }];
   }]);

   var DownloadConfig = function () {
      function DownloadConfig(url, $http) {
         _classCallCheck(this, DownloadConfig);

         this.$http = $http;
         this.location = url;
      }

      _createClass(DownloadConfig, [{
         key: 'child',
         value: function child(name) {
            return this.config.then(function (data) {
               return data[name];
            });
         }
      }, {
         key: 'initiateServiceTemplates',
         get: function get() {
            return child('initiateServiceTemplates');
         }
      }, {
         key: 'processingTemplates',
         get: function get() {
            return child('processing');
         }
      }, {
         key: 'outputFormat',
         get: function get() {
            return child('outFormat');
         }
      }, {
         key: 'outputCoordinateSystem',
         get: function get() {
            return child('outCoordSys');
         }
      }, {
         key: 'datasets',
         get: function get() {
            return child('datasets');
         }
      }, {
         key: 'config',
         get: function get() {
            return this.$http.get(this.location, { cache: true }).then(function (response) {
               return response.data;
            });
         }
      }]);

      return DownloadConfig;
   }();
})(angular);
"use strict";

(function (angular) {

	'use strict';

	angular.module("ed.dataset", []).directive("edDataset", [function () {
		return {
			templateUrl: "download/dataset/dataset.html",
			scope: {
				dataset: "="
			},
			controller: "selectCtrl",
			controllerAs: "select",
			link: function link(scope, element, attrs) {
				console.log("What's up doc!");
			}
		};
	}])

	/**
  * Format the publication date
  */
	.filter("pubDate", function () {
		return function (string) {
			var date;
			if (string) {
				date = new Date(string);
				return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
			}
			return "-";
		};
	})

	/**
  * Format the array of authors
  */
	.filter("authors", function () {
		return function (auth) {
			if (auth) {
				return auth.join(", ");
			}
			return "-";
		};
	})

	/**
  * If the text is larger than a certain size truncate it and add some dots to the end.
  */
	.filter("truncate", function () {
		return function (text, length) {
			if (text && text.length > length - 3) {
				return text.substr(0, length - 3) + "...";
			}
			return text;
		};
	}).controller("selectCtrl", SelectCtrl);

	function SelectCtrl() {
		console.log("9999999999999999999999999999999");
	}
})(angular);
'use strict';

(function (angular) {

   'use strict';

   angular.module("ed.email", []).directive('edEmail', [function () {
      return {
         templateUrl: 'download/email/email.html',
         scope: {
            processing: "="
         }
      };
   }]);
})(angular);
"use strict";

(function (angular) {

	'use strict';

	angular.module("ed.downloader", []).directive("edDownloadButton", ['configService', function (configService) {
		return {
			template: "<button ng-click='item.showDownload = !item.showDownload' type='button' class='undecorated' title='Click to start download'>" + "<i class='fa fa-lg fa-download' ng-class='{active:item.showDownload}'></i></button>",
			scope: {
				item: "="
			},
			link: function link(scope, element, attrs) {
				console.log("What's up item!");
			}
		};
	}]).directive("edDownloadPanel", ['edDownloadService', 'flashService', function (edDownloadService, flashService) {
		return {
			templateUrl: "download/downloader/downloader.html",
			scope: {
				item: "="
			},
			link: function link(scope, element, attrs) {
				var clipMessage;

				scope.processing = {
					clip: {},

					get valid() {
						return this.validClip && this.validEmail;
					},

					get validClip() {
						return validClip(this.clip);
					},

					get validEmail() {
						return this.email;
					},

					get validProjection() {
						return this.outCoordSys;
					},

					get validFormat() {
						return this.outFormat;
					},

					get percentComplete() {
						return (this.validClip ? 25 : 0) + (this.validEmail ? 25 : 0) + (this.validProjection ? 25 : 0) + (this.validFormat ? 25 : 0);
					}
				};

				scope.drawn = function () {
					return draw();
				};

				scope.$watch('item.showDownload', function (value, oldValue) {
					if (scope.processing.validClip) {
						if (value) {
							edDownloadService.showClip(scope.processing.clip);
						} else {
							edDownloadService.removeClip(scope.processing.clip.layer);
						}
					}

					if (value && !scope.processing.email) {
						edDownloadService.getEmail().then(function (email) {
							scope.processing.email = email;
						});
					}
				});

				function draw() {
					if (constrainBounds(scope.processing.clip, scope.item.bounds)) {
						clipMessage = flashService.add("Redrawn to fit within data extent", 5000);
					}

					if (scope.processing.validClip) {
						if (validSize(scope.processing.clip, scope.item.restrictSize)) {
							edDownloadService.showClip(scope.processing.clip);
							return { code: "success" };
						} else {
							clipMessage = flashService.add("That exceeds the area you can clip for this dataset. Restrict to " + scope.item.restrictSize + " square degrees.", 5000);
							return { code: "oversize" };
						}
					} else {
						return { code: "notvalid" };
					}
				}
			}
		};
	}]).directive("edDownloadSubmit", ['configService', 'edDownloadService', 'messageService', function (configService, edDownloadService, messageService) {
		return {
			templateUrl: "download/downloader/submit.html",
			scope: {
				item: "=",
				processing: "="
			},
			link: function link(scope, element, attrs) {
				scope.submit = function () {
					var processing = scope.processing;

					edDownloadService.setEmail(processing.email);

					// Assemble data
					edDownloadService.submit(scope.item.processing.template, {
						id: scope.item.primaryId,
						yMin: processing.clip.yMin,
						yMax: processing.clip.yMax,
						xMin: processing.clip.xMin,
						xMax: processing.clip.xMax,
						outFormat: processing.outFormat.code,
						outCoordSys: processing.outCoordSys.code,
						filename: processing.filename ? processing.filename : "",
						email: processing.email
					});
					messageService.success("Submitted your job. An email will be delivered on completion.");
				};
			}
		};
	}]).factory("edDownloadService", DownloadService);

	function validClip(clip) {
		var valid = isFinite(clip.yMax) && isFinite(clip.xMax) && isFinite(clip.yMin) && isFinite(clip.xMin);
		valid = valid && clip.yMax < 90 && clip.yMin > -90 && clip.xMax <= 180 && clip.xMin >= -180;
		valid = valid && clip.yMax > clip.yMin && clip.xMax > clip.xMin;
		return valid;
	}

	DownloadService.$invoke = ['edMapUtilsService', 'persistService'];
	function DownloadService(edMapUtilsService, persistService) {
		var key = "download_email";
		var CLIPOPTIONS = {
			weight: 2,
			opacity: 0.9,
			fill: false,
			color: "#000000",
			width: 3,
			clickable: false
		};

		return {

			showClip: function showClip(clip) {
				this.removeClip(clip.layer);

				var bounds = [[clip.yMin, clip.xMin], [clip.yMax, clip.xMax]];

				clip.layer = edMapUtilsService.createBounds(bounds, CLIPOPTIONS);
				edMapUtilsService.showLayer(clip.layer);
			},

			removeClip: function removeClip(layer) {
				if (layer) {
					edMapUtilsService.hideLayer(layer);
				}
			},

			setEmail: function setEmail(email) {
				persistService.setItem(key, email);
			},

			getEmail: function getEmail() {
				return persistService.getItem(key).then(function (value) {
					return value;
				});
			},
			// https://elvis20161a-ga.fmecloud.com/fmejobsubmitter/elvis_prod/DEMClipZipShip_Master_S3Source.fmw?geocat_number=${id}&out_grid_name=${filename}&input_coord_sys=LL-WGS84&ymin=${yMin}&ymax=${yMax}&xmin=${xMin}&xmax=${xMax}&output_format=${outFormat}&out_coord_sys=${outCoordSys}&email_address=${email}&opt_showresult=false&opt_servicemode=async
			submit: function submit(template, parameters) {
				var workingString = template;

				angular.forEach(parameters, function (item, key) {
					workingString = workingString.replace("${" + key + "}", item);
				});

				$("#launcher")[0].src = workingString;
			}
		};
	}

	// The input validator takes care of order and min/max constraints. We just check valid existance.
	function validSize(clip) {
		var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;

		return clip && angular.isNumber(clip.xMax) && angular.isNumber(clip.xMin) && angular.isNumber(clip.yMax) && angular.isNumber(clip.yMin) && !overSizeLimit(clip, size) && !underSizeLimit(clip);
	}

	function underSizeLimit(clip) {
		var size = (clip.xMax - clip.xMin) * (clip.yMax - clip.yMin);
		return size < 0.00000000001 || clip.xMax < clip.xMin;
	}

	function overSizeLimit(clip, size) {
		// Shouldn't need abs but it doesn't hurt.
		var actual = Math.abs((clip.xMax - clip.xMin) * (clip.yMax - clip.yMin));
		return size && actual > size;
	}

	function constrainBounds(c, p) {
		var flag = false,
		    ret = false;

		// Have we read the parameters yet?
		if (!p || empty(c.xMax) || empty(c.xMin) || empty(c.yMax) || empty(c.yMin)) {
			return false;
		}

		ret = flag = +c.xMax < +p.xMin;
		if (flag) {
			c.xMax = +p.xMin;
		}

		flag = +c.xMax > +p.xMax;
		ret = ret || flag;

		if (flag) {
			c.xMax = +p.xMax;
		}

		flag = +c.xMin < +p.xMin;
		ret = ret || flag;
		if (flag) {
			c.xMin = +p.xMin;
		}

		flag = +c.xMin > +c.xMax;
		ret = ret || flag;
		if (flag) {
			c.xMin = c.xMax;
		}

		// Now for the Y's
		flag = +c.yMax < +p.yMin;
		ret = ret || flag;
		if (flag) {
			c.yMax = +p.yMin;
		}

		flag = +c.yMax > +p.yMax;
		ret = ret || flag;
		if (flag) {
			c.yMax = +p.yMax;
		}

		flag = +c.yMin < +p.yMin;
		ret = ret || flag;
		if (flag) {
			c.yMin = +p.yMin;
		}

		flag = +c.yMin > +c.yMax;
		ret = ret || flag;
		if (flag) {
			c.yMin = +c.yMax;
		}

		return ret;

		function empty(val) {
			return angular.isUndefined(val) || val === "" || val === null;
		}
	}
})(angular);
"use strict";

(function (angular) {

	'use strict';

	angular.module("ed.formats", []).directive("edFormats", ['edConfigService', function (edConfigService) {
		return {
			templateUrl: "download/formats/formats.html",
			scope: {
				processing: "="
			},
			link: function link(scope) {
				edConfigService.config.then(function (config) {
					scope.config = config;
				});
				console.log("What's up doc!");
			}
		};
	}]).directive("edProjection", ['edConfigService', function (edConfigService) {
		return {
			templateUrl: "download/formats/projection.html",
			scope: {
				processing: "="
			},
			link: function link(scope) {
				edConfigService.config.then(function (config) {
					scope.config = config;
				});
			}
		};
	}]).filter("edIntersect", function () {
		return intersecting;
	});

	function intersecting(collection, extent) {
		// The extent may have missing numbers so we don't restrict at that point.
		if (!extent || !angular.isNumber(extent.xMin) || !angular.isNumber(extent.xMax) || !angular.isNumber(extent.yMin) || !angular.isNumber(extent.yMax)) {
			return collection;
		}

		return collection.filter(function (item) {
			// We know these have valid numbers if it exists
			if (!item.extent) {
				return true;
			}
			// We have a restriction
			return item.extent.xMin <= extent.xMin && item.extent.xMax >= extent.xMax && item.extent.yMin <= extent.yMin && item.extent.yMax >= extent.yMax;
		});
	}
})(angular);
"use strict";

/**
 * This is the only component that knows about leaflet.
 */

(function (angular, L) {

   'use strict';

   angular.module("ed.maputils", []).factory("edMapUtilsService", ['mapService', function (mapService) {
      var normalLayerColor = "#ff7800",
          hilightLayerColor = 'darkblue';

      var service = {};

      service.createGroup = function () {
         return mapService.getMap().then(function (map) {
            var layer = L.layerGroup();
            map.addLayer(layer);
            return layer;
         });
      };

      service.removeGroup = function (group) {
         mapService.getMap().then(function (map) {
            map.removeLayer(group);
         });
      };

      service.createWmsLayer = function (url, layers) {
         return L.tileLayer.wms(url, { layers: layers,
            format: "image/png",
            transparent: true
         });
      };

      service.showLayer = function (layer, zoom) {
         mapService.getMap().then(function (map) {
            layer.addTo(map);
            if (zoom) {
               map.fitBounds(layer.getBounds());
            }
         });
      };

      service.hideLayer = function (layer) {
         mapService.getMap().then(function (map) {
            map.removeLayer(layer);
         });
      };

      service.createBounds = function (bounds) {
         var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { fill: false, color: normalLayerColor, weight: 2, opacity: 0.8 };

         // create a rectangle
         return L.rectangle(bounds, config);
      };

      service.bboxToBounds = function (bbox) {
         // "113.760230 -45.949852 162.000033 -9.205568"
         var parts = bbox.split(" ");

         return [[+parts[3], +parts[0]], [+parts[1], +parts[2]]];
      };

      return service;
   }]);
})(angular, L);
"use strict";

(function (angular) {

	'use strict';

	angular.module("ed.wms", ["ed.maputils"]).directive("edWmsButton", ['$rootScope', '$timeout', 'flashService', 'edWmsService', function ($rootScope, $timeout, flashService, edWmsService) {
		return {
			scope: {
				data: "="
			},
			restrict: 'AE',
			templateUrl: 'download/wms/wmsbutton.html',
			link: function link(scope) {
				$rootScope.$on('hide.wms', function (event, id) {
					if (scope.data && id == scope.data.sysId && scope.data.isWmsShowing) {
						scope.toggle();
					}
				});

				scope.toggle = function () {
					if (scope.data.isWmsShowing) {
						edWmsService.hide(scope.data);
					} else {
						edWmsService.show(scope.data);
					}
				};

				// In an ng-repeat this gets called
				scope.$on("$destroy", function () {
					edWmsService.hide(scope.data);
				});
			}
		};
	}]).factory("edWmsService", ['$http', '$log', '$q', '$timeout', 'edMapUtilsService', function ($http, $log, $q, $timeout, edMapUtilsService) {
		return {
			show: function show(data) {
				if (!data.layer) {
					data.layer = createLayer(data.services.wms);
				}
				data.isWmsShowing = true;
				edMapUtilsService.showLayer(data.layer);
			},

			hide: function hide(data) {
				if (!data.layer) {
					return;
				}
				data.isWmsShowing = false;
				edMapUtilsService.hideLayer(data.layer);
			}
		};

		function createLayer(service) {
			var rawUrl;

			if (service.url.indexOf("?") > -1) {
				rawUrl = service.url.substr(0, service.url.indexOf("?"));
			} else {
				rawUrl = service.url;
			}

			return edMapUtilsService.createWmsLayer(rawUrl, service.layerNames);
		}
	}]);
})(angular);
'use strict';

(function (angular) {
   'use strict';

   angular.module("ed.panel", []).directive('edPanel', ['edConfigService', function (edConfigService) {
      return {
         templateUrl: "download/panel/panel.html",
         link: function link(scope) {
            edConfigService.config.then(function (config) {
               scope.config = config;
               console.log(config);
            });
         }
      };
   }]);
})(angular);
angular.module("ed.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("download/bbox/bboxbutton.html","<button type=\"button\" class=\"undecorated\" ng-click=\"toggle()\" tooltip-placement=\"right\" tooltip=\"Show data extent on the map.\">\r\n	<i class=\"fa pad-right fa-lg\" ng-class=\"{\'fa-eye active\':data.hasBbox,\'fa-eye-slash\':!data.hasBbox}\"></i>\r\n</button>");
$templateCache.put("download/clip/clip.html","<div class=\"container-fluid\">\r\n   <div class=\"row\">\r\n      <div class=\"col-md-12\">\r\n         <button style=\"margin-top:0px;\" ng-click=\"initiateDraw()\" ng-disable=\"client.drawing\" class=\"btn btn-primary btn-xs\"><i class=\"fa fa-scissors\"></i> Draw</button>\r\n      </div>\r\n   </div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-3\"> </div>\r\n      <div class=\"col-md-8\">\r\n         <strong>Y Max:</strong>\r\n         <span><input type=\"text\" style=\"width:6em\" ng-model=\"processing.clip.yMax\"></input><span ng-show=\"showBounds && bounds\">({{bounds.yMax|number : 4}} max)</span></span>\r\n      </div>\r\n   </div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-6\">\r\n         <strong>X Min:</strong>\r\n         <span><input type=\"text\" style=\"width:6em\" ng-model=\"processing.clip.xMin\"></input><span ng-show=\"showBounds && bounds\">({{bounds.xMin|number : 4}} min)</span></span>\r\n      </div>\r\n      <div class=\"col-md-6\">\r\n         <strong>X Max:</strong>\r\n         <span><input type=\"text\" style=\"width:6em\" ng-model=\"processing.clip.xMax\"></input><span ng-show=\"showBounds && bounds\">({{bounds.xMax|number : 4}} max)</span></span>\r\n      </div>\r\n   </div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-offset-3 col-md-8\">\r\n         <strong>Y Min:</strong>\r\n         <span><input type=\"text\" style=\"width:6em\" ng-model=\"processing.clip.yMin\"></input><span ng-show=\"showBounds && bounds\">({{bounds.yMin|number : 4}} min)</span></span>\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("download/dataset/dataset.html","<div ng-class-odd=\"\'odd\'\" ng-class-even=\"\'even\'\" ng-mouseleave=\"select.lolight(dataset)\" ng-mouseenter=\"select.hilight(dataset)\">\r\n	<span ng-class=\"{ellipsis:!expanded}\" tooltip-enable=\"!expanded\" style=\"width:100%;display:inline-block;\"\r\n			tooltip-class=\"selectAbstractTooltip\" tooltip=\"{{dataset.abstract | truncate : 250}}\" tooltip-placement=\"bottom\">\r\n		<button type=\"button\" class=\"undecorated\" ng-click=\"expanded = !expanded\" title=\"Click to see more about this dataset\">\r\n			<i class=\"fa pad-right fa-lg\" ng-class=\"{\'fa-caret-down active\':expanded,\'fa-caret-right\':(!expanded)}\"></i>\r\n		</button>\r\n		<ed-download-button item=\"dataset\" group=\"group\"></ed-download-button>\r\n		<ed-wms-button data=\"dataset\"></ed-wms-button>\r\n		<ed-bbox-button data=\"dataset\"></ed-bbox-button>\r\n		<a href=\"http://www.ga.gov.au/metadata-gateway/metadata/record/{{dataset.sysId}}\" target=\"_blank\" ><strong>{{dataset.title}}</strong></a>\r\n	</span>\r\n   <ed-download-panel item=\"dataset\"></ed-download-panel>\r\n	<span ng-class=\"{ellipsis:!expanded}\" style=\"width:100%;display:inline-block;padding-right:15px;\">\r\n		{{dataset.abstract}}\r\n	</span>\r\n	<div ng-show=\"expanded\" style=\"padding-bottom: 5px;\">\r\n		<h5>Keywords</h5>\r\n		<div>\r\n			<span class=\"badge\" ng-repeat=\"keyword in dataset.keywords track by $index\">{{keyword}}</span>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("download/email/email.html","<div class=\"input-group\">\r\n   <span class=\"input-group-addon\" id=\"nedf-email\">Email</span>\r\n   <input required=\"required\" type=\"email\" ng-model=\"processing.email\" class=\"form-control\" placeholder=\"Email address to send download link\">\r\n</div>\r\n");
$templateCache.put("download/downloader/downloader.html","<div class=\"well\" ng-show=\"item.showDownload\">\r\n   <div class=\"well\">\r\n      <ed-clip processing=\"processing\" drawn=\"drawn()\"></ed-clip>\r\n      <br/>\r\n      <ed-projection processing=\"processing\"></ed-projection>\r\n   </div>\r\n   <div class=\"well\">\r\n      <ed-formats processing=\"processing\"></ed-formats>\r\n      <br/>\r\n      <ed-email processing=\"processing\"></ed-email>\r\n   </div>\r\n   <ed-download-submit processing=\"processing\" item=\"item\"></ed-download-submit>\r\n</div>");
$templateCache.put("download/downloader/submit.html","<div class=\"well\" style=\"padding-bottom:2px\">\r\n   <div class=\"row\">\r\n      <div class=\"col-md-6\" style=\"padding-top:7px\">\r\n         <div class=\"progress\">\r\n            <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{processing.percentComplete}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {{processing.percentComplete}}%;\">\r\n                <span class=\"sr-only\">60% Complete</span>\r\n            </div>\r\n         </div>\r\n      </div>\r\n      <div class=\"col-md-4\" style=\"padding-top:7px\">\r\n         <span style=\"padding-right:10px\" uib-tooltip=\"Draw a valid area to extract data.\" tooltip-placement=\"left\">\r\n            <i class=\"fa fa-scissors fa-2x\" ng-class=\"{\'ed-valid\': processing.validClip, \'ed-invalid\': !processing.validClip }\"></i>\r\n         </span>\r\n         <span style=\"padding-right:10px\" uib-tooltip=\"Select a valid coordinate system for area.\" tooltip-placement=\"left\">\r\n            <i class=\"fa fa-file-video-o fa-2x\" ng-class=\"{\'ed-valid\': processing.validProjection, \'ed-invalid\': !processing.validProjection}\"></i>\r\n         </span>\r\n         <span style=\"padding-right:10px\" uib-tooltip=\"Select a valid download format.\" tooltip-placement=\"left\">\r\n            <i class=\"fa fa-files-o fa-2x\" ng-class=\"{\'ed-valid\': processing.validFormat, \'ed-invalid\': !processing.validFormat}\"></i>\r\n         </span>\r\n         <span style=\"padding-right:10px\" uib-tooltip=\"Provide an email address.\" tooltip-placement=\"left\">\r\n            <i class=\"fa fa-envelope fa-2x\" ng-class=\"{\'ed-valid\': processing.validEmail, \'ed-invalid\': !processing.validEmail}\"></i>\r\n         </span>\r\n      </div>\r\n      <div class=\"col-md-2\">\r\n         <button class=\"btn btn-primary pull-right\" ng-disabled=\"!processing.valid\" ng-click=\"submit()\">Submit</button>\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("download/formats/formats.html","<div class=\"row\">\r\n   <div class=\"col-md-4\">\r\n      <label for=\"geoprocessOutputFormat\">\r\n					Output Format\r\n				</label>\r\n   </div>\r\n   <div class=\"col-md-8\">\r\n      <select id=\"geoprocessOutputFormat\" style=\"width:95%\" ng-model=\"processing.outFormat\" ng-options=\"opt.value for opt in config.outFormat\"></select>\r\n   </div>\r\n</div>");
$templateCache.put("download/formats/projection.html","<div class=\"row\">\r\n   <div class=\"col-md-4\">\r\n      <label for=\"geoprocessOutCoordSys\">\r\n					Coordinate System\r\n				</label>\r\n   </div>\r\n   <div class=\"col-md-8\">\r\n      <select id=\"geoprocessOutCoordSys\" style=\"width:95%\" ng-model=\"processing.outCoordSys\" ng-options=\"opt.value for opt in config.outCoordSys | edIntersect : processing.clip\"></select>\r\n   </div>\r\n</div>");
$templateCache.put("download/wms/wmsbutton.html","<button type=\"button\" class=\"undecorated\" ng-show=\"data.services.wms\" ng-click=\"toggle(data)\" title=\"Show/hide WMS layer.\"\r\n         tooltip-placement=\"right\" tooltip=\"View on map using WMS.\">\r\n	<i ng-class=\"{active:data.isWmsShowing}\" class=\"fa fa-lg fa-globe\"></i>\r\n</button>");
$templateCache.put("download/panel/panel.html","<div>\r\n	<div style=\"position:relative;padding:5px;padding-left:10px;\" class=\"scrollPanel\">\r\n		<div class=\"panel panel-default\" style=\"margin-bottom:-5px\">\r\n  			<div class=\"panel-heading\">\r\n  				<h3 class=\"panel-title\">Available datasets</h3>\r\n  			</div>\r\n  			<div class=\"panel-body\">\r\n				<div ng-repeat=\"doc in config.datasets\" style=\"padding-bottom:7px\">\r\n					<ed-dataset ng-if=\"doc.type == \'dataset\'\" dataset=\"doc\"></ed-dataset>\r\n				</div>\r\n  			</div>\r\n		</div>\r\n	</div>\r\n</div>");}]);