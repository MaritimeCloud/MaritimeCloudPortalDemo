'use strict';
angular.module('mcp.certificates', ['ui.bootstrap'])
    
    .controller('CertificateGenerateDeviceController', ['$scope', '$window', 'DeviceService', 'replaceSpacesFilter', function ($scope, $window, DeviceService, replaceSpacesFilter) {
    	$scope.device = JSON.parse($window.localStorage['device'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	DeviceService.generateCertificateForDevice($scope.device.id,
                    function(data) {
		                $scope.certificate = data.certificate;
		                $scope.privateKey = data.privateKey;
		                $scope.publicKey = data.publicKey;
        		        $scope.viewState = 'generate-success'; 
        		    },
                    function(error) { 
        		    	$scope.viewState = 'error'; 
        		    	$scope.error = error.data;
        		    }
            );
        };
        $scope.zipAndDownload = function () {
        	// TODO maybe make generel as it's used at least in 3 different methods
        	var zip = new JSZip();
        	var fullnameNoSpaces = replaceSpacesFilter($scope.device.name, '_');
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateVesselController', ['$scope', '$window', 'VesselService', 'replaceSpacesFilter', function ($scope, $window, VesselService, replaceSpacesFilter) {
    	$scope.vessel = JSON.parse($window.localStorage['vessel'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	VesselService.generateCertificateForVessel($scope.vessel.id,
                    function(data) {
		                $scope.certificate = data.certificate;
		                $scope.privateKey = data.privateKey;
		                $scope.publicKey = data.publicKey;
        		        $scope.viewState = 'generate-success'; 
        		    },
                    function(error) { 
        		    	$scope.viewState = 'error'; 
        		    	$scope.error = error.data;
        		    }
            );
        };
        $scope.zipAndDownload = function () {
        	// TODO maybe make generel as it's used at least in 3 different methods
        	var zip = new JSZip();
        	var fullnameNoSpaces = replaceSpacesFilter($scope.vessel.name, '_');
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateUserController', ['$scope', '$window', 'UserService', 'replaceSpacesFilter', function ($scope, $window, UserService, replaceSpacesFilter) {
    	$scope.user = JSON.parse($window.localStorage['user'] || '{}');
        $scope.fullname = $scope.user.firstName + ' ' + $scope.user.lastName;
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	UserService.generateCertificateForUser($scope.user.id,
                    function(data) {
		                $scope.certificate = data.certificate;
		                $scope.privateKey = data.privateKey;
		                $scope.publicKey = data.publicKey;
        		        $scope.viewState = 'generate-success'; 
        		    },
                    function(error) { 
        		    	$scope.viewState = 'error'; 
        		    	$scope.error = error.data;
        		    }
            );
        };
        $scope.zipAndDownload = function () {
        	// TODO maybe make generel as it's used at least in 3 different methods
        	var zip = new JSZip();
        	var fullnameNoSpaces = replaceSpacesFilter($scope.fullname, '_');
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateRevokeDeviceController', ['$scope', '$location', '$stateParams', '$window', 'DeviceService', 'CertificateRevocationViewModel', function ($scope, $location, $stateParams, $window, DeviceService, CertificateRevocationViewModel) {
    	
    	$scope.device = JSON.parse($window.localStorage['device'] || '{}');
        $scope.reasons = CertificateRevocationViewModel.reasons;
             
        $scope.date = new Date();
        $scope.updateDate = function(date) {
            $scope.date = date;
        };
        $scope.openDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datePopup.opened = true;
        };
        $scope.dateOptions = {
        	    dateDisabled: false,
        	    formatYear: 'yy',
        	    maxDate: new Date(2070, 5, 22),
        	    minDate: new Date(),
        	    startingDay: 1
        	  };
        $scope.datePopup = {
            opened: false
        };
        
        $scope.reason = null;
        $scope.updateReason = function(reason) {
            $scope.reason = reason;
        };
        $scope.revokeCertificate = function () {
        	DeviceService.revokeCertificateForDevice($scope.device.id, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoDeviceDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoDeviceDetails = function () {
                $location.path('/devices/' + $scope.device.id).replace();
            };
        };
    }])
    
    .controller('CertificateRevokeUserController', ['$scope', '$location', '$stateParams', '$window', 'UserService', 'CertificateRevocationViewModel', function ($scope, $location, $stateParams, $window, UserService, CertificateRevocationViewModel) {
    	
    	$scope.user = JSON.parse($window.localStorage['user'] || '{}');
        $scope.fullname = $scope.user.firstName + ' ' + $scope.user.lastName;
        $scope.reasons = CertificateRevocationViewModel.reasons;
             
        $scope.date = new Date();
        $scope.updateDate = function(date) {
            $scope.date = date;
        };
        $scope.openDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datePopup.opened = true;
        };
        $scope.dateOptions = {
        	    dateDisabled: false,
        	    formatYear: 'yy',
        	    maxDate: new Date(2070, 5, 22),
        	    minDate: new Date(),
        	    startingDay: 1
        	  };
        $scope.datePopup = {
            opened: false
        };
        
        $scope.reason = null;
        $scope.updateReason = function(reason) {
            $scope.reason = reason;
        };
        $scope.revokeCertificate = function () {
        	UserService.revokeCertificateForUser($scope.user.id, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoUserDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoUserDetails = function () {
                $location.path('/users/' + $scope.user.id).replace();
            };
        };
    }])
    
    .controller('CertificateRevokeVesselController', ['$scope', '$location', '$stateParams', '$window', 'VesselService', 'CertificateRevocationViewModel', function ($scope, $location, $stateParams, $window, VesselService, CertificateRevocationViewModel) {
    	
    	$scope.vessel = JSON.parse($window.localStorage['vessel'] || '{}');
        $scope.reasons = CertificateRevocationViewModel.reasons;
             
        $scope.date = new Date();
        $scope.updateDate = function(date) {
            $scope.date = date;
        };
        $scope.openDate = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datePopup.opened = true;
        };
        $scope.dateOptions = {
        	    dateDisabled: false,
        	    formatYear: 'yy',
        	    maxDate: new Date(2070, 5, 22),
        	    minDate: new Date(),
        	    startingDay: 1
        	  };
        $scope.datePopup = {
            opened: false
        };
        
        $scope.reason = null;
        $scope.updateReason = function(reason) {
            $scope.reason = reason;
        };
        $scope.revokeCertificate = function () {
        	VesselService.revokeCertificateForVessel($scope.vessel.id, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoVesselDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoVesselDetails = function () {
                $location.path('/vessels/' + $scope.vessel.id).replace();
            };
        };
    }])
    ;