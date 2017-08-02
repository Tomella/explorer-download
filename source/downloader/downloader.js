
(function(angular) {

'use strict';

angular.module("ed.downloader", [])

.directive("edDownloadButton", ['configService', function(configService) {
	return {
		template : "<button ng-click='item.showDownload = !item.showDownload' type='button' class='undecorated' title='Click to start download'>" +
               "<i class='fa fa-lg fa-download' ng-class='{active:item.showDownload}'></i></button>",
      scope: {
         item: "="
      },
		link: function(scope, element, attrs) {
			console.log("What's up item!");
		}
	};
}])

.directive("edDownloadPanel", ['edDownloadService', 'flashService', function(edDownloadService, flashService) {
	return {
		templateUrl : "download/downloader/downloader.html",
      scope: {
         item: "="
      },
		link: function(scope, element, attrs) {
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
               return (this.validClip? 25: 0) + (this.validEmail? 25: 0) +
                  (this.validProjection? 25: 0) + (this.validFormat? 25: 0);
            }
         };

         scope.drawn = function() {
            return draw();
         };

         scope.$watch('item.showDownload', function(value, oldValue) {
            if(scope.processing.validClip) {
               if(value) {
                  edDownloadService.showClip(scope.processing.clip);
               } else {
                  edDownloadService.removeClip(scope.processing.clip.layer);
               }
            }

            if(value && !scope.processing.email) {
               edDownloadService.getEmail().then(email => {
                  scope.processing.email = email;
               });
            }
         });

         function draw() {
				if(constrainBounds(scope.processing.clip, scope.item.bounds)) {
					clipMessage = flashService.add("Redrawn to fit within data extent", 5000);
				}

            if(scope.processing.validClip) {
               if(validSize(scope.processing.clip, scope.item.restrictSize)) {
                  edDownloadService.showClip(scope.processing.clip);
                  return {code: "success"};
               } else {
					   clipMessage = flashService.add("That exceeds the area you can clip for this dataset. Restrict to " +
                        scope.item.restrictSize + " square degrees.", 5000);
                  return {code: "oversize"};
               }
            } else {
               return {code: "notvalid"};
            }
         }
		}
	};
}])

.directive("edDownloadSubmit", ['configService', 'edDownloadService', 'messageService', function(configService, edDownloadService, messageService) {
	return {
		templateUrl : "download/downloader/submit.html",
      scope: {
         item: "=",
         processing: "="
      },
		link: function(scope, element, attrs) {
			scope.submit = function() {
            let processing = scope.processing;

            edDownloadService.setEmail(processing.email);

            // Assemble data
            edDownloadService.submit(scope.item.processing.template,
            {
					id : scope.item.primaryId,
					yMin : processing.clip.yMin,
					yMax : processing.clip.yMax,
					xMin : processing.clip.xMin,
					xMax : processing.clip.xMax,
					outFormat : processing.outFormat.code,
					outCoordSys : processing.outCoordSys.code,
					email : processing.email
            });
            messageService.success("Submitted your job. An email will be delivered on completion.");
         };
		}
	};
}])

.factory("edDownloadService", DownloadService);

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
				weight:2,
				opacity:0.9,
				fill:false,
				color: "#000000",
				width:3,
				clickable: false
			};

	return {

		showClip : function(clip) {
		   this.removeClip(clip.layer);

         let bounds = [
			    [clip.yMin, clip.xMin],
			    [clip.yMax, clip.xMax]
			];

			clip.layer = edMapUtilsService.createBounds(bounds, CLIPOPTIONS);
         edMapUtilsService.showLayer(clip.layer);
		},

		removeClip : function(layer) {
			if(layer) {
				edMapUtilsService.hideLayer(layer);
			}
		},


		setEmail : function(email) {
			persistService.setItem(key, email);
		},

		getEmail : function() {
			return persistService.getItem(key).then(function(value) {
				return value;
			});
		},
      // https://elvis20161a-ga.fmecloud.com/fmejobsubmitter/elvis_prod/DEMClipZipShip_Master_S3Source.fmw?geocat_number=${id}&out_grid_name=${filename}&input_coord_sys=LL-WGS84&ymin=${yMin}&ymax=${yMax}&xmin=${xMin}&xmax=${xMax}&output_format=${outFormat}&out_coord_sys=${outCoordSys}&email_address=${email}&opt_showresult=false&opt_servicemode=async
      submit: function(template, parameters) {
         var workingString = template;

			angular.forEach(parameters, function(item, key) {
				workingString = workingString.replace("${" + key + "}", item);
			});

			$("#launcher")[0].src = workingString;
      }
	};
}



// The input validator takes care of order and min/max constraints. We just check valid existance.
function validSize(clip, size = 16) {
	return clip &&
		angular.isNumber(clip.xMax) &&
		angular.isNumber(clip.xMin) &&
		angular.isNumber(clip.yMax) &&
		angular.isNumber(clip.yMin) &&
		!overSizeLimit(clip, size) &&
		!underSizeLimit(clip);
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
	if(!p || empty(c.xMax) || empty(c.xMin) || empty(c.yMax) || empty(c.yMin)) {
		return false;
	}

	ret = flag = +c.xMax < +p.xMin;
	if(flag) {
		c.xMax = +p.xMin;
	}

	flag = +c.xMax > +p.xMax;
	ret = ret || flag;

	if(flag) {
		c.xMax = +p.xMax;
	}

	flag = +c.xMin < +p.xMin;
	ret = ret || flag;
	if(flag) {
		c.xMin = +p.xMin;
	}

	flag = +c.xMin > +c.xMax;
	ret = ret || flag;
	if(flag) {
		c.xMin = c.xMax;
	}

	// Now for the Y's
	flag = +c.yMax < +p.yMin;
	ret = ret || flag;
	if(flag) {
		c.yMax = +p.yMin;
	}

	flag = +c.yMax > +p.yMax;
	ret = ret || flag;
	if(flag) {
		c.yMax = +p.yMax;
	}

	flag = +c.yMin < +p.yMin;
	ret = ret || flag;
	if(flag) {
		c.yMin = +p.yMin;
	}

	flag = +c.yMin > +c.yMax;
	ret = ret || flag;
	if(flag) {
		c.yMin = +c.yMax;
	}

	return ret;

	function empty(val) {
		return angular.isUndefined(val) ||
			val === "" ||
			val === null;
	}
}


})(angular);
