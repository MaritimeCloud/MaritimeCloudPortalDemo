'use strict';

/* Controllers */

angular.module('mcp.organizations', ['ui.bootstrap'])
    .controller('JoinController', ['$scope', 'OrganizationService', function ($scope, OrganizationService) {
        
        $scope.submit = function () {
            $scope.alertMessages = null;
            $scope.message = "Sending request to update organization...";
            $scope.registered = false;
            $scope.busyPromise = OrganizationService.apply($scope.organization,
                function (data) {
                    $scope.message = "Organization registered. A confirmation email will be send to " + $scope.organization.email;
                    $scope.registered = true;
                    
                    // Check if there is a logo uploaded
                    var logo = $scope.logo();
                    if (logo) {
                        $scope.uploadLogo(logo);
                    } 
                },
                function (error) {
                    $scope.message = null;
                    $scope.registered = false;
                    $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                }
            );
            $scope.logo = function () {
                var logoFiles = $('#orgLogo')[0].files;
                return logoFiles.length > 0 ? logoFiles[0] : null;
            };
            $scope.uploadLogo = function (logo) {
                var fd = new FormData();
                fd.append('logo', logo);
                OrganizationService.uploadLogo($scope.organization.shortName+'ddddd', fd,
                    function (data) {
                	    $scope.gotoOrgDetails()
                    },
                    function (error) {
                        $scope.message = "Organization registered. A confirmation email will be send to " + $scope.organization.email ;
                        $scope.alertMessages = ["However there was an error uploading the Logo. This can be retried once access is granted."];
                    }
                );
            };
        };
    }])
    
    .controller('OrganizationListController', ['$scope', '$stateParams', 'OrganizationService', 'Utils',
        function ($scope, $stateParams, OrganizationService, Utils) {

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
                    	var logo = OrganizationService.getLogo(org.shortName);           	
                    	Utils.isImage(logo).then(function(result) {
                			if (result) {
                				org.logo = logo;
                			} else {
                            	org.logo = '/app/img/no_org.png';        				
                			}
                        });
                    	
                        var c = org.country;
                        if (c && c.length && $.inArray(c, $scope.countries) == -1) {
                            $scope.countries.push(c);
                        }
                    });
                });
            };

            $scope.loadOrganizations();

        }])


    .controller('OrganizationDetailsController', ['$scope', '$stateParams', '$window', 'OrganizationService', 'RoleService', 'RoleNameViewModel', 'Auth', 'Utils', 'replaceSpacesFilter', 'replaceNewlinesFilter',
        function ($scope, $stateParams, $window, OrganizationService, RoleService, RoleNameViewModel, Auth, Utils, replaceSpacesFilter, replaceNewlinesFilter) {
    	    $scope.dateFormat = dateFormat;
	        $scope.rolesModels = RoleNameViewModel.roleNames;
            OrganizationService.get({shortName: $stateParams.shortName}, function (org) {
            	var logo = OrganizationService.getLogo(org.shortName);           	
            	Utils.isImage(logo).then(function(result) {
        			if (result) {
        				org.logo = logo;
        			} else {
                    	org.logo = '/app/img/no_org.png';        				
        			}
                });
                $scope.organization = org;
                $window.localStorage['organization'] = JSON.stringify(org);

                // TODO How should revoked certificates be handled?
                if ($scope.organization.certificates){
                   $scope.organization.certificates = $scope.organization.certificates.filter(function(certificate) {
                       return !certificate.revoked;
                   });
                }
            });
            
            RoleService.getRoles({}, function (result) {
            	angular.forEach(result, function(role, index){

                	for(var i=0;i<$scope.rolesModels.length;i++) {
                		var roleModel = $scope.rolesModels[i];
                		if (roleModel.roleNameId === role.roleName){
                            role.roleNameText = roleModel.roleNameText;
                		}
                	}
        	    	
            	});
         	   $scope.roles = result;
            });
            $scope.zipAndDownloadCertificate = function (certificate) {
            	// TODO maybe make generel as it's used at least in 3 different methods
            	var zip = new JSZip();
            	var orgNameNoSpaces = replaceSpacesFilter($scope.organization.shortName, '_');
            	certificate.certificate = replaceNewlinesFilter(certificate.certificate);
            	zip.file("Certificate_" + orgNameNoSpaces + ".pem", certificate.certificate);
            	
            	var content = zip.generate({type:"blob"});
            	// see FileSaver.js
            	saveAs(content, "Certificate_" + orgNameNoSpaces + ".zip");
            };
            $scope.isAdmin = function () {
                return angular.equals($stateParams.shortName, auth.org) && auth.permissions.indexOf("MCADMIN") > -1;
            };
            $scope.isMyOrg = function () {
                return angular.equals($stateParams.shortName, auth.org);
            };

	        $scope.adding = false;

    	    $scope.updateRoleName = function(roleName) {
    	    	$scope.roleName = roleName;
            };
            
            $scope.addNewRole = function() {
    	        $scope.adding = true;
            	$scope.role = {};
            	$scope.roleName = $scope.rolesModels[0];
            };
            
            $scope.cancelRole = function() {
    	        $scope.adding = false;
            };
                
            $scope.removeRole = function(index) {
            	$scope.alertMessages = null;
    	        $scope.adding = false;
    	        RoleService.deleteRole($scope.roles[index].id,
                        function(data) {
                    $scope.roles.splice(index, 1);
            		    },
                        function(error) { 
                            $scope.message = null;
                            $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
            		    }
                );
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
    	        $scope.role.roleName = $scope.roleName.roleNameId;
    	        RoleService.create($scope.role,
                        function(data) {
        	        $scope.adding = false;
    	        	$window.location.reload(); 
            		    },
                        function(error) { 
                            $scope.message = null;
                            $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
            		    }
                );
            };
        }
    ])


    .controller('OrganizationEditController', ['$scope', '$http', '$stateParams', '$location', 'OrganizationService', 'Auth', 'Utils',
        function ($scope, $http, $stateParams, $location, OrganizationService, Auth, Utils) {

            $scope.isAdmin = function () {
                return angular.equals($stateParams.shortName, auth.org) && auth.permissions.indexOf("MCADMIN") > -1;
            };
            
            $scope.countries = countries;
            
            OrganizationService.get({shortName: $stateParams.shortName}, function (org) {
            	var logo = OrganizationService.getLogo(org.shortName);           	
            	Utils.isImage(logo).then(function(result) {
        			if (result) {
        				org.logo = logo;
        			} else {
                    	org.logo = '/app/img/no_org.png';        				
        			}
                });
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
                        var logo = $scope.logo();
                        if (logo) {
                            $scope.uploadLogo(logo);
                        } else {
                            $scope.gotoOrgDetails();
                        }
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
            };

            $scope.logo = function () {
                var logoFiles = $('#orgLogo')[0].files;
                return logoFiles.length > 0 ? logoFiles[0] : null;
            };

            $scope.uploadLogo = function (logo) {
                var fd = new FormData();
                fd.append('logo', logo);
                OrganizationService.uploadLogo($scope.organization.shortName, fd,
                    function (data) {
                	    $scope.gotoOrgDetails()
                    },
                    function (error) {
                        $scope.message = null;
                        $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                    }
                );
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

