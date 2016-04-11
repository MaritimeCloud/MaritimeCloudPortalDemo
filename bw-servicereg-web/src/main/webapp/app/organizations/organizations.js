'use strict';

/* Controllers */

angular.module('mcp.organizations', ['ui.bootstrap'])

    .controller('DashboardController', ['$scope', '$rootScope', '$http', 'UserOldService', 'ServiceStatsService', '$window',
        function ($scope, $rootScope, $http, UserOldService, ServiceStatsService, $window) {
            $scope.orderProp = 'name';
            
            var loginBackendStatus =  $window.localStorage.getItem('loginBackendStatus');
            var loginBackendStatusText = '';
            if (loginBackendStatus == 'false') {
            	loginBackendStatusText = 'NOT LOGGED IN TO BACKEND';
                $window.localStorage.setItem('currentOrgShortName', '');
            	$window.localStorage.setItem('loginBackendStatusText',  loginBackendStatusText);
                $scope.loginStatusError = loginBackendStatusText;
      		    $scope.loginStatusOk = null;
            } else {
            	loginBackendStatusText =  $window.localStorage.getItem('loginBackendStatusText');
      		    $scope.loginStatusError = null;
    		    $scope.loginStatusOk = loginBackendStatusText;
            }

            $scope.loginBackend = function () {
          	    var loginName = 'DMA';
          	    var loginPassword = 'ohg678vlhgkf4855hkjuulva5q';
          	    var inputData = $.param({
                    username: loginName,
                    password: loginPassword       
                });
            	
            	var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
                $window.localStorage.setItem('currentOrgShortName', '');
            	$http.post('https://localhost:8443/login', inputData, config)
            	.success(function (data, status, headers, config) {
                    $window.localStorage.setItem('currentOrgShortName', loginName);
            	    loginBackendStatusText = 'Logged in as ' + loginName;
                    $window.localStorage.setItem('loginBackendStatusText',  loginBackendStatusText);
                    $window.localStorage.setItem('loginBackendStatus',  true);
            		$scope.loginStatusError = null;
            		$scope.loginStatusOk = loginBackendStatusText;
                })
                .error(function (data, status, headers, config) {
                	loginBackendStatusText = 'Error in login. Error was: ' + data + ", with status: " + status;
                  	$window.localStorage.setItem('loginBackendStatusText',  loginBackendStatusText);
                    $window.localStorage.setItem('loginBackendStatus',  false);
                	
          		    $scope.loginStatusError = loginBackendStatusText;
        		    $scope.loginStatusOk = null;
                });
            };
            
            $scope.$watch(
                function () {
                    return $scope.userName;
                },
                function (newValue, oldValue) {
                    if (newValue) {
                        $scope.loadUserMemberOrganizations();
                    } else {
                        $scope.organizations = [];
                    }
                });

            $scope.loadUserMemberOrganizations = function () {
            	UserOldService.queryUserMemberOrganizations({userId: $scope.currentUser.userId}, function (orgs) {
                    $scope.organizations = orgs;
                });
            };

            ServiceStatsService.get(function (stats) {
                $scope.statistics = stats;
            });

        }])


    .controller('OrganizationListController', ['$scope', '$stateParams', 'OrganizationService',
        function ($scope, $stateParams, OrganizationService) {

            $scope.organizations = [];
            $scope.countries = [];
            $scope.filter = {
                query: '',
                country: '',
                member: false
            };
            $scope.orderProp = 'name';
            $scope.$stateParams = $stateParams;

            function match(val, filter) {
                if (!filter || filter.length == 0) {
                    return true;
                }
                filter = filter.toLowerCase();
                return val != null && val.toLowerCase().indexOf(filter) != -1;
            }

            $scope.orgFilter = function (org) {
                if ($scope.filter.country.length > 0 && $scope.filter.country != org.country) {
                    return false;
                }
                return match(org.name, $scope.filter.query) || match(org.id, $scope.filter.query);
            };

            $scope.loadOrganizations = function () {
            	OrganizationService.getOrganizationList({}, function (result) {
                    $scope.organizations = result;
                    $scope.countries = [];

                    $.each(result, function(index, org) {
                    	if (org.logo == null || org.logo.length == 0) {
                		    org.logo = '/app/img/organization.png';
                    	}
                        var c = org.country;
                        if (c && c.length && $.inArray(c, $scope.countries) == -1) {
                            $scope.countries.push(c);
                        }
                    });
                });
            };

            $scope.loadOrganizations();

        }])


    .controller('OrganizationDetailsController', ['$scope', '$stateParams', 'OrganizationService', 'Auth',
        function ($scope, $stateParams, OrganizationService, Auth) {

            OrganizationService.get({shortName: $stateParams.shortName}, function (org) {
            	if (org.logo == null || org.logo.length == 0) {
        		    org.logo = '/app/img/organization.png';
            	}
                $scope.organization = org;
            });

            $scope.isAdmin = function () {
                return angular.equals($stateParams.shortName, auth.org);
            };
        }
    ])


    .controller('OrganizationEditController', ['$scope', '$http', '$stateParams', '$location', 'OrganizationService',
        function ($scope, $http, $stateParams, $location, OrganizationService) {

            $scope.isAdmin = function () {
                return angular.equals($stateParams.shortName, auth.org);
            };
            
            $scope.countries = countries;
            
            OrganizationService.get({shortName: $stateParams.shortName}, function (org) {
            	if (org.logo == null || org.logo.length == 0) {
        		    org.logo = '/app/img/organization.png';
            	}
                $scope.organization = org;
            });

            $scope.gotoOrgDetails = function () {
                $location.path('/orgs/' + $scope.organization.shortName).replace();
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update organization...";
                $scope.busyPromise = OrganizationService.update($scope.organization,
                    function (data) {
                        // Check if there is a logo uploaded
//                        var logo = $scope.logo();
//                        if (logo) {
//                            $scope.uploadLogo(logo, $scope.gotoOrgDetails, $scope.gotoOrgDetails);
//                        } else {
//                            $scope.gotoOrgDetails();
//                        }
                        $scope.gotoOrgDetails();
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside ", error.statusText];
                    }
                );
            };

            $scope.logo = function () {
                var logoFiles = $('#orgLogo')[0].files;
                return logoFiles.length > 0 ? logoFiles[0] : null;
            };

            $scope.uploadLogo = function (logo, success, error) {
                var fd = new FormData();
                fd.append('attachment', logo);

                $http.post('/rest/api/org/' + $scope.organization.organizationId + '/logo', fd, {
                        headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    })
                    .success(success)
                    .error(error);
            };

        }])


    .directive('organizationListDetails', ['OrganizationService',
        function (OrganizationService) {
            return {
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    org: "=org",
                    reload: '&reload'
                },
                templateUrl: "organizations/organization-list-details.html",
                link: function (scope, element, attrs) {

                    scope.loadOrganizations = function () {
                        if (scope.reload) {
                            scope.reload({});
                        }
                    };
                }
            };
        }])
;

