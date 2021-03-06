'use strict';
angular.module('mcp.devices', ['ui.bootstrap'])

    .controller('DeviceListController', ['$scope', 'DeviceService', 'replaceSpacesFilter', 'Utils', 'Auth', function ($scope, DeviceService, replaceSpacesFilter, Utils, Auth) {
    	$scope.isAdmin = function () {
            return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = DeviceService.getDeviceList({}, function (result) {
            	angular.forEach(result, function(device, index){
            		// TODO get image url from somewhere
            		device.imageUrl = '/app/img/no_device.svg'; // TODO get image url from somewhere
            		/*
            		var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(device.name, '_'));
                	var imageUrl = '/app/img/devices/' + fullnameNoSpaces + '.jpg';
                	
            		Utils.isImage(imageUrl).then(function(result) {
            			if (result) {
                            device.imageUrl = imageUrl;
            			}
                    });
            		*/
        	    	
            	});
                $scope.devices = result;
            });
        };
        
        // load devices
        $scope.updateSearch();
    }])

    .controller('DeviceDetailController', ['$scope', '$stateParams', '$window', '$location', 'DeviceService', 'confirmDialog', 'replaceSpacesFilter', 'replaceNewlinesFilter', 'Utils', 'Auth', function ($scope, $stateParams, $window, $location, DeviceService, confirmDialog, replaceSpacesFilter, replaceNewlinesFilter, Utils, Auth) {
        $scope.dateFormat = dateFormat;
    	$scope.isAdmin = function () {
            return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	DeviceService.get({mrn: $stateParams.mrn}, function (device) {
    		device.imageUrl = '/app/img/no_device.svg'; // TODO get image url from somewhere
    		/*
    		var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(device.name, '_'));
        	var imageUrl = '/app/img/devices/' + fullnameNoSpaces + '.jpg';
        	
    		Utils.isImage(imageUrl).then(function(result) {
    			if (result) {
                    device.imageUrl = imageUrl;
    			}
            });*/
                $scope.device = device;
                $window.localStorage['device'] = JSON.stringify(device);
                
                // TODO How should revoked certificates be handled?
                $scope.device.certificates = $scope.device.certificates.filter(function(certificate) {
                    return !certificate.revoked;
                });
        });
    	$scope.deleteDevice = function () {
	    	confirmDialog('Are you sure you want to delete the device?').then(function () {
	    		DeviceService.deleteDevice($scope.device.mrn,
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
        	certificate.certificate = replaceNewlinesFilter(certificate.certificate);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", certificate.certificate);
        	
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

    	    DeviceService.get({mrn: $stateParams.mrn}, function (device) {
                $scope.device = device;
            });
    	    
            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update device...";

                $scope.gotoDeviceDetails = function () {
                    $location.path('/devices/' + $scope.device.mrn).replace();
                };
                
                $scope.busyPromise = DeviceService.update($scope.device,
                    function (data) {
                       $scope.gotoDeviceDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };
        }
    ])
    
    .controller('DeviceCreateController', ['$scope', '$location', 'DeviceService', 'Auth',
        function ($scope, $location, DeviceService, Auth) {
    	    $scope.org = Auth.org;
    	    $scope.device = {};
    	    
    	    var orgSplit = $scope.org.split(':');
    	    var orgShortname = orgSplit[orgSplit.length-1];    	  
    	    $scope.mrnId = '';
    	    var originalMrn = 'urn:mrn:mcl:device:' + orgShortname + ':';
    	    $scope.device.mrn = originalMrn;
    	    $scope.updateMrn = function () {
    	    	var mrnId = $scope.mrnId;
    	    	if(!mrnId) {
    	    		mrnId = '';
    	    	}
        	    $scope.device.mrn = originalMrn + mrnId;
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to create device...";

                $scope.gotoDeviceDetails = function () {
                    $location.path('/devices/' + $scope.device.mrn).replace();
                };
                
                $scope.busyPromise = DeviceService.create($scope.device,
                    function (data) {
                	    $scope.device = data;
                        $scope.gotoDeviceDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
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

