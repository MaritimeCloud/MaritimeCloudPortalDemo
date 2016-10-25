'use strict';
angular.module('mcp.certificates', ['ui.bootstrap'])
    .controller('CertificateGenerateOrganizationController', ['$scope', '$window', 'OrganizationService', 'replaceSpacesFilter', 'replaceNewlinesFilter', function ($scope, $window, OrganizationService, replaceSpacesFilter, replaceNewlinesFilter) {
    	$scope.org = JSON.parse($window.localStorage['organization'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	OrganizationService.generateCertificateForOrganization(
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
        	var fullnameNoSpaces = replaceSpacesFilter($scope.org.name, '_');
        	$scope.certificate = replaceNewlinesFilter($scope.certificate);
        	$scope.privateKey = replaceNewlinesFilter($scope.privateKey);
        	$scope.publicKey = replaceNewlinesFilter($scope.publicKey);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateDeviceController', ['$scope', '$window', 'DeviceService', 'replaceSpacesFilter', 'replaceNewlinesFilter', function ($scope, $window, DeviceService, replaceSpacesFilter, replaceNewlinesFilter) {
    	$scope.device = JSON.parse($window.localStorage['device'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	DeviceService.generateCertificateForDevice($scope.device.mrn,
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
        	$scope.certificate = replaceNewlinesFilter($scope.certificate);
        	$scope.privateKey = replaceNewlinesFilter($scope.privateKey);
        	$scope.publicKey = replaceNewlinesFilter($scope.publicKey);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateServiceIdentityController', ['$scope', '$window', 'ServiceIdentityService', 'replaceSpacesFilter', 'replaceNewlinesFilter', function ($scope, $window, ServiceIdentityService, replaceSpacesFilter, replaceNewlinesFilter) {
    	$scope.service = JSON.parse($window.localStorage['service-identity'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	ServiceIdentityService.generateCertificateForService($scope.service.mrn,
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
        	var fullnameNoSpaces = replaceSpacesFilter($scope.service.name, '_');
        	$scope.certificate = replaceNewlinesFilter($scope.certificate);
        	$scope.privateKey = replaceNewlinesFilter($scope.privateKey);
        	$scope.publicKey = replaceNewlinesFilter($scope.publicKey);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateVesselController', ['$scope', '$window', 'VesselService', 'replaceSpacesFilter', 'replaceNewlinesFilter', function ($scope, $window, VesselService, replaceSpacesFilter, replaceNewlinesFilter) {
    	$scope.vessel = JSON.parse($window.localStorage['vessel'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	VesselService.generateCertificateForVessel($scope.vessel.mrn,
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
        	$scope.certificate = replaceNewlinesFilter($scope.certificate);
        	$scope.privateKey = replaceNewlinesFilter($scope.privateKey);
        	$scope.publicKey = replaceNewlinesFilter($scope.publicKey);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    
    .controller('CertificateGenerateUserController', ['$scope', '$window', 'UserService', 'replaceSpacesFilter', 'replaceNewlinesFilter', function ($scope, $window, UserService, replaceSpacesFilter, replaceNewlinesFilter) {
    	$scope.user = JSON.parse($window.localStorage['user'] || '{}');
        $scope.fullname = $scope.user.firstName + ' ' + $scope.user.lastName;
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	UserService.generateCertificateForUser($scope.user.mrn,
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
        	$scope.certificate = replaceNewlinesFilter($scope.certificate);
        	$scope.privateKey = replaceNewlinesFilter($scope.privateKey);
        	$scope.publicKey = replaceNewlinesFilter($scope.publicKey);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", $scope.certificate);
        	zip.file("PrivateKey_" + fullnameNoSpaces + ".pem", $scope.privateKey);
        	zip.file("PublicKey_" + fullnameNoSpaces + ".pem", $scope.publicKey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
    }])
    .controller('CertificateRevokeOrganizationController', ['$scope', '$location', '$stateParams', '$window', 'OrganizationService', 'CertificateRevocationViewModel', function ($scope, $location, $stateParams, $window, OrganizationService, CertificateRevocationViewModel) {
    	
    	$scope.org = JSON.parse($window.localStorage['organization'] || '{}');
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
        	OrganizationService.revokeCertificateForOrganization($stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoOrganizationDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoOrganizationDetails = function () {
                $location.path('/').replace();
            };
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
        	DeviceService.revokeCertificateForDevice($scope.device.mrn, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoDeviceDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoDeviceDetails = function () {
                $location.path('/devices/' + $scope.device.mrn).replace();
            };
        };
    }])
    
    .controller('CertificateRevokeServiceIdentityController', ['$scope', '$location', '$stateParams', '$window', 'ServiceIdentityService', 'CertificateRevocationViewModel', function ($scope, $location, $stateParams, $window, ServiceIdentityService, CertificateRevocationViewModel) {
    	
    	$scope.service = JSON.parse($window.localStorage['service-identity'] || '{}');
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
        	ServiceIdentityService.revokeCertificateForService($scope.service.mrn, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoServiceDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoServiceDetails = function () {
                $location.path('/service-identities/' + $scope.service.mrn).replace();
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
        	UserService.revokeCertificateForUser($scope.user.mrn, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoUserDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoUserDetails = function () {
                $location.path('/users/' + $scope.user.mrn).replace();
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
        	VesselService.revokeCertificateForVessel($scope.vessel.mrn, $stateParams.certId, $scope.reason.reasonId, $scope.date,
                    function(data) {
        		        $scope.gotoVesselDetails(); 
        		    },
                    function(error) { 
        		    	$scope.error = error.data;
        		    }
            );

        	$scope.gotoVesselDetails = function () {
                $location.path('/vessels/' + $scope.vessel.mrn).replace();
            };
        };
    }])
    ;