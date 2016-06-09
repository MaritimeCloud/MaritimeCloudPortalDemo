'use strict';
angular.module('mcp.users', ['ui.bootstrap'])

    .controller('UserListController', ['$scope', 'UserService', function ($scope, UserService) {
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	$scope.updateSearch = function () {
            $scope.busyPromise = UserService.getUserList({}, function (result) {
            	angular.forEach(result, function(user, index){
            		user.imageUrl = '/app/img/profile.jpg'; // TODO get image url from somewhere
            	});
                $scope.users = result;
            });
        };
        
        // load users
        $scope.updateSearch();
    }])

    .controller('UserDetailController', ['$scope', '$stateParams', '$window', '$location', 'UserService', 'confirmDialog', 'replaceSpacesFilter', function ($scope, $stateParams, $window, $location, UserService, confirmDialog, replaceSpacesFilter) {
        $scope.dateFormat = dateFormat;
    	$scope.isAdmin = function () {
            return true; // TODO role management
        };
    	UserService.get({userId: $stateParams.userId}, function (user) {
    	    	user.imageUrl = '/app/img/profile.jpg'; // TODO get image url from somewhere
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
	    		UserService.deleteUser($scope.user.id,
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
        	zip.file("Certificate_" + fullnameNoSpaces + ".cer", certificate.certificate);
        	
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

    	    UserService.get({userId: $stateParams.userId}, function (user) {
    	    	user.imageUrl = '/app/img/profile.jpg'; // TODO get image url from somewhere
                $scope.user = user;
            });
    	    
            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update user...";

                $scope.gotoUserDetails = function () {
                    $location.path('/users/' + $scope.user.id).replace();
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

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to create user...";

                $scope.gotoUserDetails = function () {
                    $location.path('/users/' + $scope.user.id).replace();
                };
                
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

