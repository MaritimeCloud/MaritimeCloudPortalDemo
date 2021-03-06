'use strict';
angular.module('mcp.users', ['ui.bootstrap'])

    .controller('UserListController', ['$scope', 'UserService', 'Auth', function ($scope, UserService, Auth) {
    	$scope.isAdmin = function () {
    		return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = UserService.getUserList({}, function (result) {
            	angular.forEach(result, function(user, index){
            		user.imageUrl = '/app/img/no_user.jpg'; // TODO get image url from somewhere
            	});
                $scope.users = result;
            });
        };
        
        // load users
        $scope.updateSearch();
    }])

    .controller('UserDetailController', ['$scope', '$stateParams', '$window', '$location', 'UserService', 'confirmDialog', 'replaceSpacesFilter', 'replaceNewlinesFilter', 'Auth', function ($scope, $stateParams, $window, $location, UserService, confirmDialog, replaceSpacesFilter, replaceNewlinesFilter, Auth) {
        $scope.dateFormat = dateFormat;
    	$scope.isAdmin = function () {
    		return auth.permissions.indexOf("MCADMIN") > -1; // TODO role management
        };
    	UserService.get({mrn: $stateParams.mrn}, function (user) {
    	    	user.imageUrl = '/app/img/no_user.jpg'; // TODO get image url from somewhere
                $scope.user = user;
                $window.localStorage['user'] = JSON.stringify(user);
                $scope.fullname = user.firstName + ' ' + user.lastName;
                
             // TODO How should revoked certificates be handled?
                $scope.user.certificates = $scope.user.certificates.filter(function(certificate) {
                    return !certificate.revoked;
                });
        });
    	$scope.deleteUser = function () {
	    	confirmDialog('Are you sure you want to delete the user?').then(function () {
	    		UserService.deleteUser($scope.user.mrn,
                        function(data) {
                    		$scope.gotoUserList();
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
        	var fullnameNoSpaces = replaceSpacesFilter($scope.fullname, '_');
        	certificate.certificate = replaceNewlinesFilter(certificate.certificate);
        	zip.file("Certificate_" + fullnameNoSpaces + ".pem", certificate.certificate);
        	
        	var content = zip.generate({type:"blob"});
        	// see FileSaver.js
        	saveAs(content, "Certificate_" + fullnameNoSpaces + ".zip");
        };
        $scope.gotoUserList = function () {
            $location.path('/users').replace();
        };
    }])
    .controller('UserEditController', ['$scope', '$http', '$stateParams', '$location', 'UserService',
        function ($scope, $http, $stateParams, $location, UserService) {

    	    UserService.get({mrn: $stateParams.mrn}, function (user) {
    	    	user.imageUrl = '/app/img/no_user.jpg'; // TODO get image url from somewhere
                $scope.user = user;
            });
    	    
            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update user...";

                $scope.gotoUserDetails = function () {
                    $location.path('/users/' + $scope.user.mrn).replace();
                };
                
                $scope.busyPromise = UserService.update($scope.user,
                    function (data) {
                       $scope.gotoUserDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };
        }
    ])
    
    .controller('UserCreateController', ['$scope', '$location', 'UserService', 'Auth',
        function ($scope, $location, UserService, Auth) {
    	    $scope.org = Auth.org;
    	    $scope.user = {};
    	    
    	    var orgSplit = $scope.org.split(':');
    	    var orgShortname = orgSplit[orgSplit.length-1];    	  
    	    $scope.mrnId = '';
    	    var originalMrn = 'urn:mrn:mcl:user:' + orgShortname + ':';
    	    $scope.user.mrn = originalMrn;
    	    $scope.updateMrn = function () {
    	    	var mrnId = $scope.mrnId;
    	    	if(!mrnId) {
    	    		mrnId = '';
    	    	}
        	    $scope.user.mrn = originalMrn + mrnId;
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to create user...";

                $scope.gotoUserDetails = function () {
                    $location.path('/users/' + $scope.user.mrn).replace();
                };
                $scope.user.userOrgId = angular.lowercase($scope.org) + "." + $scope.user.userOrgId;
                $scope.busyPromise = UserService.create($scope.user,
                    function (data) {
                	    $scope.user = data;
                        $scope.gotoUserDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };
        }
    ])


    .directive('userListDetails', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                user: "="
            },
            templateUrl: "users/user-list-details.html",
            link: function (scope, element, attrs) {
            }
        };
    })
    ;

