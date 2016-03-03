'use strict';
angular.module('mcp.vessels', ['ui.bootstrap'])
    .controller('VesselListController', ['$scope', '$window', 'VesselService', function ($scope, $window, VesselService) {
        $scope.updateSearch = function () {
            var orgShortName = $window.localStorage.getItem('currentOrgShortName');
            $scope.busyPromise = VesselService.getVesselList({}, function (result) {
            	angular.forEach(result, function(vessel, index){
            		vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
            	});
                $scope.vessels = result;
            });
        };
        
        // load vessels
        $scope.updateSearch();
    }])
      
    .controller('VesselDetailController', ['$scope', '$window', '$stateParams', 'VesselService',
        function ($scope, $window, $stateParams, VesselService) {
      	    var orgShortName = $window.localStorage.getItem('currentOrgShortName');
    	    VesselService.get({vesselId: $stateParams.vesselId}, function (vessel) {
    	    	vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
                $scope.vessel = vessel;
            });
        }
    ])
    
    .directive('vesselListDetails', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                vessel: "="
            },
            templateUrl: "vessels/vessel-list-details.html",
            link: function (scope, element, attrs) {
            }
        };
    })
    ;