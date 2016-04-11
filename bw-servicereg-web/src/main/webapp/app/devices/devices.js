'use strict';
angular.module('mcp.devices', ['ui.bootstrap'])

    .controller('DeviceListController', ['$scope', 'DeviceService', function ($scope, DeviceService) {
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = DeviceService.getDeviceList({}, function (result) {
                $scope.devices = result;
            });
        };
        
        // load devices
        $scope.updateSearch();
    }])

    .controller('DeviceDetailController', ['$scope', '$stateParams', '$window', '$location', 'DeviceService', 'confirmDialog', 'replaceSpacesFilter', function ($scope, $stateParams, $window, $location, DeviceService, confirmDialog, replaceSpacesFilter) {
        $scope.dateFormat = dateFormat;
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	DeviceService.get({deviceId: $stateParams.deviceId}, function (device) {
                $scope.device = device;
                $window.localStorage['device'] = JSON.stringify(device);
        });
    	$scope.deleteDevice = function () {
	    	confirmDialog('Are you sure you want to delete the device?').then(function () {
	    		DeviceService.deleteDevice($scope.device.id,
                        function(data) {
                    		$scope.gotoDeviceList();
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
        	var fullnameNoSpaces = replaceSpacesFilter($scope.device.name, '_');
        	zip.file("Certificate_" + fullnameNoSpaces + ".cer", certificate.certificate);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
        $scope.gotoDeviceList = function () {
            $location.path('/devices').replace();
        };
    }])
    .controller('DeviceEditController', ['$scope', '$http', '$stateParams', '$location', 'DeviceService',
        function ($scope, $http, $stateParams, $location, DeviceService) {

    	    DeviceService.get({deviceId: $stateParams.deviceId}, function (device) {
                $scope.device = device;
            });
    	    
            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update device...";

                $scope.gotoDeviceDetails = function () {
                    $location.path('/devices/' + $scope.device.id).replace();
                };
                
                $scope.busyPromise = DeviceService.update($scope.device,
                    function (data) {
                       $scope.gotoDeviceDetails();
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
    
    .controller('DeviceCreateController', ['$scope', '$location', 'DeviceService', 'Auth',
        function ($scope, $location, DeviceService, Auth) {
    	    $scope.org = Auth.org;
    	    $scope.device = {};

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to create device...";

                $scope.gotoDeviceDetails = function () {
                    $location.path('/devices/' + $scope.device.id).replace();
                };
                
                $scope.busyPromise = DeviceService.create($scope.device,
                    function (data) {
                	    $scope.device = data;
                        $scope.gotoDeviceDetails();
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


    .directive('deviceListDetails', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                device: "="
            },
            templateUrl: "devices/device-list-details.html",
            link: function (scope, element, attrs) {
            }
        };
    })
    ;

