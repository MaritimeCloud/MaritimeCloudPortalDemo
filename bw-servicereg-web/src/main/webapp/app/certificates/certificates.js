'use strict';
angular.module('mcp.certificates', ['ui.bootstrap'])
    .controller('CertificateVesselGenerateController', ['$scope', '$window', 'VesselService', function ($scope, $window, VesselService) {
    	$scope.vessel = JSON.parse($window.localStorage['vessel'] || '{}');
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	VesselService.generateCertificateForVessel($scope.vessel.id,
                    function(data) {
		                $scope.certificate = data.certificate;
		                $scope.privatekey = data.privatekey;
		                $scope.publickey = data.publickey;
        		        $scope.viewState = 'generate-success'; 
        		    },
                    function(error) { 
        		    	$scope.viewState = 'error'; 
        		    	$scope.error = error.data;
        		    }
            );
        };
        $scope.zipAndDownload = function () {
        	var zip = new JSZip();
        	zip.file("Certificate_" + $scope.vessel.name + ".cer", $scope.certificate);
        	zip.file("PrivateKey_" + $scope.vessel.name + ".pkr", $scope.privatekey);
        	zip.file("PublicKey_" + $scope.vessel.name + ".skr", $scope.publickey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + $scope.vessel.name + ".zip");
        };
    }])
    
    .controller('CertificateUserGenerateController', ['$scope', '$window', 'UserService', function ($scope, $window, UserService) {
    	$scope.user = JSON.parse($window.localStorage['user'] || '{}');
        $scope.fullname = $scope.user.firstName + ' ' + $scope.user.lastName;
        $scope.viewState = 'generate-certificate';

        $scope.generateCertificate = function () {
        	UserService.generateCertificateForUser($scope.user.id,
                    function(data) {
		                $scope.certificate = data.certificate;
		                $scope.privatekey = data.privatekey;
		                $scope.publickey = data.publickey;
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
        	zip.file("Certificate_" + $scope.fullname + ".cer", $scope.certificate);
        	zip.file("PrivateKey_" + $scope.fullname + ".pkr", $scope.privatekey);
        	zip.file("PublicKey_" + $scope.fullname + ".skr", $scope.publickey);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + $scope.fullname + ".zip");
        };
    }])
    
    ;