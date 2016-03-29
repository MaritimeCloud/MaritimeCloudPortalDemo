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


    .controller('OrganizationListController', ['$scope', '$stateParams', 'UserOldService',
        function ($scope, $stateParams, UserOldService) {

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
                if ($scope.filter.member && org.userRoles.length == 0) {
                    return false;
                }
                return match(org.name, $scope.filter.query) || match(org.organizationId, $scope.filter.query);
            };

            $scope.loadUserOrganizations = function () {
            	UserOldService.queryUserOrganizations({userId: $scope.currentUser.userId}, function (orgs) {
                    $scope.organizations = orgs;
                    $scope.countries = [];

                    $.each(orgs, function(index, org) {
                        var c = org.country;
                        if (c && c.length && $.inArray(c, $scope.countries) == -1) {
                            $scope.countries.push(c);
                        }
                    });
                });
            };

            $scope.loadUserOrganizations();

        }])


    .controller('OrganizationDetailsController', ['$scope', '$stateParams', 'OrganizationService',
        'ServiceSpecificationService', 'ServiceInstanceService',
        function ($scope, $stateParams, OrganizationService, ServiceSpecificationService,
                  ServiceInstanceService) {

            OrganizationService.get({organizationId: $stateParams.organizationId}, function (organization) {
                $scope.organization = organization;
            });

            $scope.isAdmin = function () {
                return $scope.hasSiteRole($scope.siteRoles.admin) || $scope.hasOrganizationRole($scope.orgRoles.admin);
            };

            $scope.hasOrganizationRole = function (orgRole) {
                return $scope.organization && $scope.organization.userRoles
                    && $.inArray(orgRole, $scope.organization.userRoles) != -1;
            };

            $scope.specifications = ServiceSpecificationService.query({organizationId: $stateParams.organizationId});
            $scope.serviceInstances = ServiceInstanceService.query({organizationId: $stateParams.organizationId});
        }])


    .controller('OrganizationCreateController', ['$scope', '$http', '$location', 'OrganizationService',
        function ($scope, $http, $location, OrganizationService) {

            $scope.countries = countries;
            $scope.organization = {organizationId: null, name: null, url: null};

            $scope.formIsSubmitable = function () {
                return ($scope.organization.name && $scope.organization.organizationId && !$scope.idAlreadyExist);
            };

            $scope.mrn = function () {
                return $scope.organization.organizationId
                    ? "urn:mrn:mc:org:" + $scope.organization.organizationId.toLowerCase().replace(' ', '_')
                    : ''
            };

            $scope.gotoOrgDetails = function () {
                $location.path('/orgs/' + $scope.organization.organizationId).replace();
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to create organization...";

                $scope.busyPromise = OrganizationService.create($scope.organization,
                    function (data) {
                        // Check if there is a logo uploaded
                        var logo = $scope.logo();
                        if (logo) {
                            $scope.uploadLogo(logo, $scope.gotoOrgDetails, $scope.gotoOrgDetails);
                        } else {
                            $scope.gotoOrgDetails();
                        }
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

            $scope.resolveUniqueId = function () {
                if (!angular.isDefined($scope.organization.organizationId)) {
                    $scope.idAlreadyExist = false;
                    $scope.idNotDefined = true;
                    return;
                }
                $scope.idNotDefined = false;
                OrganizationService.exists({organizationId: $scope.organization.organizationId},
                    function (response) {
                        $scope.idAlreadyExist = response.result == 'true';
                    });
            };

            $scope.$watch("organization.organizationId",
                function (newValue, oldValue, scope) {
                    if (newValue !== oldValue) {
                        scope.resolveUniqueId();
                    }
                }
            );

        }])


    .controller('OrganizationEditController', ['$scope', '$http', '$stateParams', '$location', 'OrganizationService',
        function ($scope, $http, $stateParams, $location, OrganizationService) {

            $scope.countries = countries;

            OrganizationService.get({organizationId: $stateParams.organizationId}, function (organization) {
                $scope.organization = organization;
            });

            $scope.gotoOrgDetails = function () {
                $location.path('/orgs/' + $scope.organization.organizationId).replace();
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to update organization...";

                $scope.busyPromise = OrganizationService.update($scope.organization,
                    function (data) {
                        // Check if there is a logo uploaded
                        var logo = $scope.logo();
                        if (logo) {
                            $scope.uploadLogo(logo, $scope.gotoOrgDetails, $scope.gotoOrgDetails);
                        } else {
                            $scope.gotoOrgDetails();
                        }
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


    .directive('organizationListDetails', ['AuthService', 'OrganizationService', 'ORG_ROLES',
        function (AuthService, OrganizationService, ORG_ROLES) {
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

                    scope.hasOrganizationRole = AuthService.hasOrganizationRole;
                    scope.currentUser = AuthService.currentUser();
                    scope.orgRoles = ORG_ROLES;

                    scope.loadOrganizations = function () {
                        if (scope.reload) {
                            scope.reload({});
                        }
                    };

                    scope.cancelApplication = function (org) {
                        OrganizationService.updateRole(org, scope.currentUser.userId, ORG_ROLES.applicant, 'reject',
                            function () {
                                scope.loadOrganizations()
                            },
                            function (error) {
                                console.error("Error cancelling application " + error);
                            })
                    };

                    scope.acceptInvitation = function (org) {
                        OrganizationService.updateRole(org, scope.currentUser.userId, ORG_ROLES.invited, 'accept',
                            function () {
                                scope.loadOrganizations()
                            },
                            function (error) {
                                console.error("Error accepting invitation " + error);
                            })
                    };

                    scope.rejectInvitation = function (org) {
                        OrganizationService.updateRole(org, scope.currentUser.userId, ORG_ROLES.invited, 'reject',
                            function () {
                                scope.loadOrganizations()
                            },
                            function (error) {
                                console.error("Error rejecting invitation " + error);
                            })
                    };

                }
            };
        }])
;

