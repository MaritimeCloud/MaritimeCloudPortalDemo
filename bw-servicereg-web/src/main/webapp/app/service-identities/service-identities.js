'use strict';
angular.module('mcp.service-identities', ['ui.bootstrap'])

    .controller('ServiceIdentityListController', ['$scope', 'ServiceIdentityService', 'replaceSpacesFilter', 'Utils', 'Auth', function ($scope, ServiceIdentityService, replaceSpacesFilter, Utils, Auth) {
    	$scope.isAdmin = function () {
    		return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = ServiceIdentityService.getServiceList({}, function (result) {
            	angular.forEach(result, function(service, index){
            		// TODO get image url from somewhere
            		service.imageUrl = '/app/img/no_service.svg'; // TODO get image url from somewhere
            		/*
            		var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(service.name, '_'));
                	var imageUrl = '/app/img/services/' + fullnameNoSpaces + '.jpg';
                	
            		Utils.isImage(imageUrl).then(function(result) {
            			if (result) {
                            service.imageUrl = imageUrl;
            			}
                    });
            		*/
        	    	
            	});
                $scope.services = result;
            });
        };
        
        // load services
        $scope.updateSearch();
    }])

    .controller('ServiceIdentityDetailController', ['$scope', '$stateParams', '$window', '$location', 'ServiceIdentityService', 'confirmDialog', 'replaceSpacesFilter', 'replaceNewlinesFilter', 'Utils', 'Auth', function ($scope, $stateParams, $window, $location, ServiceIdentityService, confirmDialog, replaceSpacesFilter, replaceNewlinesFilter, Utils, Auth) {
        $scope.dateFormat = dateFormat;
    	$scope.isAdmin = function () {
    		return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	ServiceIdentityService.get({serviceId: $stateParams.serviceId}, function (service) {
    		service.imageUrl = '/app/img/no_service.svg'; // TODO get image url from somewhere
    		/*
    		var fullnameNoSpaces = angular.lowercase(replaceSpacesFilter(service.name, '_'));
        	var imageUrl = '/app/img/services/' + fullnameNoSpaces + '.jpg';
        	
    		Utils.isImage(imageUrl).then(function(result) {
    			if (result) {
                    service.imageUrl = imageUrl;
    			}
            });*/
                $scope.service = service;
                $window.localStorage['service-identity'] = JSON.stringify(service);
                
                // TODO How should revoked certificates be handled?
                $scope.service.certificates = $scope.service.certificates.filter(function(certificate) {
                    return !certificate.revoked;
                });
        });
    	$scope.deleteService = function () {
	    	confirmDialog('Are you sure you want to delete the service?').then(function () {
	    		ServiceIdentityService.deleteService($scope.service.id,
                        function(data) {
                    		$scope.gotoServiceList();
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
        	var fullnameNoSpaces = replaceSpacesFilter($scope.service.name, '_');
        	certificate.certificate = replaceNewlinesFilter(certificate.certificate);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", certificate.certificate);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
        $scope.gotoServiceList = function () {
            $location.path('/service-identities').replace();
        };
    }])
    .controller('ServiceIdentityEditController', ['$scope', '$http', '$stateParams', '$location', 'ServiceIdentityService', 'AccessTypeViewModel',
        function ($scope, $http, $stateParams, $location, ServiceIdentityService, AccessTypeViewModel) {

	        $scope.accessTypes = AccessTypeViewModel.accessTypes;
    	    ServiceIdentityService.get({serviceId: $stateParams.serviceId}, function (service) {
                $scope.service = service;
                $scope.accessType = null;
                if (service.oidcAccessType){
                	for(var i=0;i<$scope.accessTypes.length;i++) {
                		var accessType = $scope.accessTypes[i];
                		if (accessType.accessTypeId === service.oidcAccessType){
                            $scope.accessType = accessType;
                		}
                	}                	
                }
            });
    	    
    	    $scope.updateAccessType = function(accessType) {
    	    	$scope.accessType = accessType;
            };
    	    
            $scope.submit = function () {
            	if($scope.accessType){
            	    $scope.service.oidcAccessType = $scope.accessType.accessTypeId;
            	}
                $scope.alertMessages = null;
                $scope.message = "Sending request to update service...";

                $scope.gotoServiceDetails = function () {
                    $location.path('/service-identities/' + $scope.service.id).replace();
                };
                
                $scope.busyPromise = ServiceIdentityService.update($scope.service,
                    function (data) {
                       $scope.gotoServiceDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };
        }
    ])
    
    .controller('ServiceIdentityCreateController', ['$scope', '$location', 'ServiceIdentityService', 'Auth', 'AccessTypeViewModel',
        function ($scope, $location, ServiceIdentityService, Auth, AccessTypeViewModel) {
	        $scope.service = {};
	        $scope.accessType = null;
    	    $scope.accessTypes = AccessTypeViewModel.accessTypes;
    	    $scope.updateAccessType = function(accessType) {
    	    	$scope.accessType = accessType;
            };
            
    	    $scope.org = Auth.org;

            $scope.submit = function () {
            	if($scope.accessType){
            	    $scope.service.oidcAccessType = $scope.accessType.accessTypeId;
            	}
                $scope.alertMessages = null;
                $scope.message = "Sending request to create service...";

                $scope.gotoServiceDetails = function () {
                    $location.path('/service-identities/' + $scope.service.id).replace();
                };
                
                $scope.busyPromise = ServiceIdentityService.create($scope.service,
                    function (data) {
                	    $scope.service = data;
                        $scope.gotoServiceDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };
        }
    ])


    .directive('serviceListDetails', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                service: "="
            },
            templateUrl: "service-identities/service-identity-list-details.html",
            link: function (scope, element, attrs) {
            }
        };
    })
    ;

