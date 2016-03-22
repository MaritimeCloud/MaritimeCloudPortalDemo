'use strict';
angular.module('mcp.vessels', ['ui.bootstrap'])
    .controller('VesselListController', ['$scope', '$window', 'VesselService', 'Auth', function ($scope, $window, VesselService, Auth) {
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	$scope.updateSearch = function () {
            var orgShortName = Auth.org;
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
      
    .controller('VesselDetailController', ['$scope', '$location', '$window', '$stateParams', 'VesselService', 'Auth', 'confirmDialog',
        function ($scope, $location, $window, $stateParams, VesselService, Auth, confirmDialog) {
            var orgShortName = Auth.org;
            $scope.dateFormat = dateFormat;
      	    $scope.isAdmin = function () {
                return true; // TODO role management
            };
    	    VesselService.get({vesselId: $stateParams.vesselId}, function (vessel) {
    	    	vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
                $scope.vessel = vessel;
                $window.localStorage['vessel'] = JSON.stringify(vessel);
            });
    	    $scope.deleteVessel = function () {
    	    	confirmDialog('Are you sure you want to delete the vessel?').then(function () {
    	    		VesselService.deleteVessel($scope.vessel.id,
                            function(data) {
                        		$scope.gotoVesselList();
                		    },
                            function(error) { 
                		    	// TODO handle error
                		    }
                    );
    	    	});
            };
    	    $scope.revokeCertificate = function (index) {
    	    	confirmDialog('Are you sure you want to revoke the certificate?').then(function () {
    	    		VesselService.revokeCertificateForVessel($scope.vessel.id, $scope.vessel.certificates[index].id,
                            function(data) {
                                $scope.vessel.certificates.splice(index, 1);
                		    },
                            function(error) { 
                		    	// TODO handle error
                		    }
                    );
    	    	});
            };
            $scope.gotoVesselList = function () {
                $location.path('/vessels').replace();
            };
        }
    ])
    .controller('VesselEditController', ['$scope', '$http', '$stateParams', '$location', 'VesselService',
        function ($scope, $http, $stateParams, $location, VesselService) {

            VesselService.get({vesselId: $stateParams.vesselId}, function (vessel) {
    	    	vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
                $scope.vessel = vessel;
            });
            
            $scope.isAttributeValueValid = function(attribute) {
                return attribute.attributeValue && attribute.attributeValue.length > 0;
            };
            $scope.isAttributeNameValid = function(attribute) {
                return attribute.attributeName && attribute.attributeName.length > 0;
            };
            
            $scope.addNewAttribute = function() {
                $scope.vessel.attributes.push({'attributeName':'', 'attributeValue':''});
            };
                
            $scope.removeAttribute = function(index) {
                $scope.vessel.attributes.splice(index, 1);
            };
           
            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update vessel...";

                $scope.gotoVesselDetails = function () {
                    $location.path('/vessels/' + $scope.vessel.id).replace();
                };
                
                $scope.busyPromise = VesselService.update($scope.vessel,
                    function (data) {
                       $scope.gotoVesselDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside ", error.statusText];
                    }
                );
            };
        }])
        
    .controller('VesselCreateController', ['$scope', '$http', '$stateParams', '$location', 'VesselService', 'Auth',
        function ($scope, $http, $stateParams, $location, VesselService, Auth) {
    	    $scope.org = Auth.org;
    	    $scope.vessel = {};
            $scope.attributes = [];

            $scope.isAttributeValueValid = function(attribute) {
                return attribute.attributeValue && attribute.attributeValue.length > 0;
            };
            $scope.isAttributeNameValid = function(attribute) {
                return attribute.attributeName && attribute.attributeName.length > 0;
            };
            
            $scope.addNewAttribute = function() {
                $scope.attributes.push({'attributeName':'', 'attributeValue':''});
            };
                
            $scope.removeAttribute = function(index) {
                $scope.attributes.splice(index, 1);
            };
            
            $scope.submit = function () {
            	$scope.vessel.attributes = $scope.attributes;
                $scope.alertMessages = null;
                $scope.message = "Sending request to update vessel...";

                $scope.gotoVesselDetails = function () {
                    $location.path('/vessels/' + $scope.vessel.id).replace();
                };
                
                $scope.busyPromise = VesselService.create($scope.vessel,
                    function (data) {
                	    $scope.vessel = data;
                        $scope.gotoVesselDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside ", error.statusText];
                    }
                );
            };
        }])
    
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