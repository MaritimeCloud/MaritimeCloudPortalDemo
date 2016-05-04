'use strict';
angular.module('mcp.vessels', ['ui.bootstrap'])
    .controller('VesselListController', ['$scope', 'VesselService', 'replaceSpacesFilter', function ($scope, VesselService, replaceSpacesFilter) {
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = VesselService.getVesselList({}, function (result) {
            	angular.forEach(result, function(vessel, index){
            		vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere

                	var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(vessel.name, '_'));
                	vessel.imageUrl = '/app/img/vessels/' + fullnameNoSpaces + '.jpg';
        	    	
            	});
                $scope.vessels = result;
            });
        };
        
        // load vessels
        $scope.updateSearch();
    }])
      
    .controller('VesselDetailController', ['$scope', '$location', '$window', '$stateParams', 'VesselService', 'confirmDialog', 'replaceSpacesFilter',
        function ($scope, $location, $window, $stateParams, VesselService, confirmDialog, replaceSpacesFilter) {
            $scope.dateFormat = dateFormat;
      	    $scope.isAdmin = function () {
                return true; // TODO role management
            };
    	    VesselService.get({vesselId: $stateParams.vesselId}, function (vessel) {
    	    	vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
            	var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(vessel.name, '_'));
            	vessel.imageUrl = '/app/img/vessels/' + fullnameNoSpaces + '.jpg';
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
            $scope.zipAndDownloadCertificate = function (certificate) {
            	// TODO maybe make generel as it's used at least in 3 different methods
            	var zip = new JSZip();
            	var vesselNameNoSpaces = replaceSpacesFilter($scope.vessel.name, '_');
            	zip.file("Certificate_" + vesselNameNoSpaces + ".cer", certificate.certificate);
            	
            	var content = zip.generate({type:"blob"});
            	// see FileSaver.js
            	saveAs(content, "Certificate_" + vesselNameNoSpaces + ".zip");
            };
            $scope.gotoVesselList = function () {
                $location.path('/vessels').replace();
            };
        }
    ])
    .controller('VesselEditController', ['$scope', '$http', '$stateParams', '$location', 'VesselService', 'replaceSpacesFilter',
        function ($scope, $http, $stateParams, $location, VesselService, replaceSpacesFilter) {

            VesselService.get({vesselId: $stateParams.vesselId}, function (vessel) {
    	    	vessel.imageUrl = '/app/img/no_ship.ico'; // TODO get image url from somewhere
            	var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(vessel.name, '_'));
            	vessel.imageUrl = '/app/img/vessels/' + fullnameNoSpaces + '.jpg';
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
                        // TODO errorhandling
                    }
                );
            };
        }
    ])
        
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
                $scope.message = "Sending request to create vessel...";

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
                        // TODO errorhandling
                    }
                );
            };
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