'use strict';

/* App Module */

var mcpApp = angular.module('mcpApp', [
  'ui.router',
  'ui.router.stateHelper',
  'ui.select',
  'ngSanitize',
  'angularMoment',
  'mcp.auth',
  'mcp.certificates',
  'mcp.dataservices',
  'mcp.devices',
  'mcp.directives',
  'mcp.filters',
  'mcp.layout',
 // 'mcp.mapservices',
  'mcp.models',
  'mcp.organizations',
  'mcp.service-identities',
 // 'mcp.organizations.members',
 // 'mcp.organizations.service-instances',
  //'mcp.organizations.service-specifications',
  //'mcp.search.services',
  'mcp.users',
  'mcp.vessels'
]);

var dateFormat = 'yyyy-MM-dd';
var logoTimestamp = (new Date()).getTime();

angular.element(document).ready(function () {
	bootstrapKeycloak('mcpApp', 'check-sso');
});

mcpApp
.config(['$httpProvider', '$stateProvider', 'stateHelperProvider', '$urlRouterProvider',
  function($httpProvider, $stateProvider, stateHelperProvider, $urlRouterProvider) {
    $urlRouterProvider.when("", "/");

    // Enable use of session cookies
    $httpProvider.defaults.withCredentials = true;
    
    

    $httpProvider.interceptors.push('authHttpInterceptor');
    
    var publicArea = {
      name: 'public',
      templateUrl: 'layout/public.html',
      children: [
        {
            name: 'landingpage',
            url: "/",
            templateUrl: 'partials/landingpage.html'
        },
        {
            name: 'join',
            url: "/join",
            templateUrl: 'partials/join.html',
            controller: 'JoinController'
        }
      ]
    };

    var restrictedArea = {
      name: 'restricted',
      templateUrl: 'layout/restricted.html',
      data: {
        authorizedRoles: ['admin', 'user']
      },
      children: [
        {
            name: 'devices',
            url: "/devices",
            templateUrl: 'devices/device-list.html',
            controller: 'DeviceListController'
          },
          {
              name: 'deviceCreate',
              url: "/devices/create",
              templateUrl: 'devices/device-create.html',
              controller: 'DeviceCreateController'
          },
          {
            name: 'deviceDetails',
            url: "/devices/{mrn}",
            templateUrl: 'devices/device-detail.html',
            controller: 'DeviceDetailController'
          },
          {
              name: 'deviceEdit',
              url: "/devices/{mrn}/edit",
              templateUrl: 'devices/device-edit.html',
              controller: 'DeviceEditController'
          },
          { 
              name: 'generateCertificateDevice',
              url: "/certificates/generate/device/{mrn}",
              templateUrl: 'certificates/certificate-generate-device.html',
              controller: 'CertificateGenerateDeviceController'
          },
          { 
              name: 'revokeCertificateDevice',
              url: "/certificates/{certId}/revoke/device/{mrn}",
              templateUrl: 'certificates/certificate-revoke-device.html',
              controller: 'CertificateRevokeDeviceController'
          },   
          {
              name: 'service-identities',
              url: "/service-identities",
              templateUrl: 'service-identities/service-identity-list.html',
              controller: 'ServiceIdentityListController'
            },
            {
                name: 'service-identityCreate',
                url: "/service-identities/create",
                templateUrl: 'service-identities/service-identity-create.html',
                controller: 'ServiceIdentityCreateController'
            },
            {
              name: 'service-identityDetails',
              url: "/service-identities/{mrn}",
              templateUrl: 'service-identities/service-identity-detail.html',
              controller: 'ServiceIdentityDetailController'
            },
            {
                name: 'service-identityEdit',
                url: "/service-identities/{mrn}/edit",
                templateUrl: 'service-identities/service-identity-edit.html',
                controller: 'ServiceIdentityEditController'
            },
            { 
                name: 'generateCertificateService-identity',
                url: "/certificates/generate/service-identity/{mrn}",
                templateUrl: 'certificates/certificate-generate-service-identity.html',
                controller: 'CertificateGenerateServiceIdentityController'
            },
            { 
                name: 'revokeCertificateService-identity',
                url: "/certificates/{certId}/revoke/service-identity/{mrn}",
                templateUrl: 'certificates/certificate-revoke-service-identity.html',
                controller: 'CertificateRevokeServiceIdentityController'
            },   
        {
            name: 'vessels',
            url: "/vessels",
            templateUrl: 'vessels/vessel-list.html',
            controller: 'VesselListController'
        },
        {
            name: 'vesselCreate',
            url: "/vessels/create",
            templateUrl: 'vessels/vessel-create.html',
            controller: 'VesselCreateController'
        },
        {
            name: 'vesselDetails',
            url: "/vessels/{mrn}",
            templateUrl: 'vessels/vessel-detail.html',
            controller: 'VesselDetailController'
        },
        {
            name: 'vesselEdit',
            url: "/vessels/{mrn}/edit",
            templateUrl: 'vessels/vessel-edit.html',
            controller: 'VesselEditController'
        },
        { 
            name: 'generateCertificateVessel',
            url: "/certificates/generate/vessel/{mrn}",
            templateUrl: 'certificates/certificate-generate-vessel.html',
            controller: 'CertificateGenerateVesselController'
        },
        { 
            name: 'revokeCertificateVessel',
            url: "/certificates/{certId}/revoke/vessel/{mrn}",
            templateUrl: 'certificates/certificate-revoke-vessel.html',
            controller: 'CertificateRevokeVesselController'
        },
        {
          name: 'users',
          url: "/users",
          templateUrl: 'users/user-list.html',
          controller: 'UserListController'
        },
        {
            name: 'userCreate',
            url: "/users/create",
            templateUrl: 'users/user-create.html',
            controller: 'UserCreateController'
        },
        {
          name: 'userDetails',
          url: "/users/{mrn}",
          templateUrl: 'users/user-detail.html',
          controller: 'UserDetailController'
        },
        {
            name: 'userEdit',
            url: "/users/{mrn}/edit",
            templateUrl: 'users/user-edit.html',
            controller: 'UserEditController'
        },
        { 
            name: 'generateCertificateUser',
            url: "/certificates/generate/user/{mrn}",
            templateUrl: 'certificates/certificate-generate-user.html',
            controller: 'CertificateGenerateUserController'
        },
        { 
            name: 'revokeCertificateUser',
            url: "/certificates/{certId}/revoke/user/{mrn}",
            templateUrl: 'certificates/certificate-revoke-user.html',
            controller: 'CertificateRevokeUserController'
        },
        {
            name: 'myOrganization',
            url: "/orgs/",
            templateUrl: 'organizations/organization-detail.html',
            controller: 'OrganizationDetailsController'
          },
          { 
              name: 'generateCertificateOrganization',
              url: "/certificates/generate/org/{mrn}",
              templateUrl: 'certificates/certificate-generate-org.html',
              controller: 'CertificateGenerateOrganizationController'
          },
          { 
              name: 'revokeCertificateOrganization',
              url: "/certificates/{certId}/revoke/org/{mrn}",
              templateUrl: 'certificates/certificate-revoke-org.html',
              controller: 'CertificateRevokeOrganizationController'
          },   
        {
          name: 'searchOrganizations',
          url: "/orgs",
          templateUrl: 'organizations/organization-list.html',
          controller: 'OrganizationListController'
        },
        {
          name: 'organizationDetails',
          url: "/orgs/{mrn}",
          templateUrl: 'organizations/organization-detail.html',
          controller: 'OrganizationDetailsController'
        },
        {
          name: 'organizationEdit',
          url: "/orgs/{mrn}/edit",
          templateUrl: 'organizations/organization-edit.html',
          controller: 'OrganizationEditController'
        },
        {
          name: 'organizationMembers',
          url: "/orgs/{mrn}/members",
          templateUrl: 'organizations/members/member-list.html',
          controller: 'OrganizationMembersController'
        },
        {
          name: 'organizationMembersInvite',
          url: "/orgs/{mrn}/members/invite",
          templateUrl: 'organizations/members/membership.html',
          controller: 'OrganizationInviteMemberController'
        },
        {
          name: 'organizationMembersJoin',
          url: "/orgs/{mrn}/members/join",
          templateUrl: 'organizations/members/membership.html',
          controller: 'UserJoinOrganizationController'
        },
        {
          name: 'serviceInstanceCreate',
          url: "/orgs/{mrn}/si/create",
          templateUrl: 'organizations/service-instances/service-instance-create.html',
          controller: 'CreateServiceInstanceController',
          data: {createState: true}
        },
        {
          name: 'serviceInstanceEdit',
          url: "/orgs/{mrn}/si/{serviceInstanceId}/edit",
          templateUrl: 'organizations/service-instances/service-instance-edit.html',
          controller: 'EditServiceInstanceController',
          data: {editState: true}
        },
        {
          name: 'serviceInstanceMembers',
          url: "/orgs/{mrn}/si/{serviceInstanceId}/members",
          templateUrl: 'organizations/service-instances/service-instance-members.html',
          controller: 'ServiceInstanceMembersController',
          data: {editState: true}
        },
        {
          name: 'serviceSpecificationCreate',
          url: "/orgs/{mrn}/ss/create",
          templateUrl: 'organizations/service-specifications/service-specification-create.html',
          controller: 'CreateServiceSpecificationController',
          data: {createState: true}
        },
        {
          name: 'serviceSpecificationEdit',
          url: "/orgs/{mrn}/ss/{serviceSpecificationId}/edit",
          templateUrl: 'organizations/service-specifications/service-specification-edit.html',
          controller: 'EditServiceSpecificationController',
          data: {editState: true}
        },
        {
          name: 'searchServiceMap',
          url: "/search/service/map",
          templateUrl: 'search/search-service-map.html',
          controller: 'SearchServiceMapController'
        }
      ]
    };

    stateHelperProvider.setNestedState(publicArea);
    stateHelperProvider.setNestedState(restrictedArea);

  }])
  
    // PAGE TRANSITION: 
    // Register a "Restricting Route Access" listener
    .run(function($rootScope, $state, $location, AuthServ, Auth, RoleService) {
    	if (Auth.loggedIn){
            RoleService.getMyRoles({}, function (result) {
        	    $.each(result, function(index, role) {
        		    if (role.indexOf("ROLE_ORG_ADMIN") > -1){
                        auth.permissions = "MCADMIN";            			
        	    	}
                });
            });
    	}
        $rootScope.$on('$stateChangeStart', function(event, next, params) {

            if($rootScope.stateChangeBypass) {
                $rootScope.stateChangeBypass = false;
                return;
            }
            // If we are logged in and no route url is present, we will redirect to my organizations
            if((next.url === '/' || next.name === 'restricted.myOrganization') && Auth.loggedIn) {
                $rootScope.stateChangeBypass = true;
            	$location.path('/orgs/' + auth.org);
            	return;
            }
            
            var isRestrictedRoute = next.data && next.data.authorizedRoles;

            if (isRestrictedRoute) {
                var targetUrl = window.location.pathname + "#" + next.url;
                // TODO: How should we handle the role management
                AuthServ.hasRole('',
                    function (data) {
                        $rootScope.stateChangeBypass = true;
                        if (data) {
                            event.preventDefault();
                            $state.go(next, params);
                        } else {
                            console.error("Restriced Route Access: user is not authorized" + data);
                            $location.path("/");
                        }
                    },
                    function (data) {
                        $rootScope.stateChangeBypass = true;
                        console.log("Restriced Route Access: user is not logged in", next);
                        $location.path("/");
                    }
                );
            }
        });
    })
    // This factory defines an asynchronous wrapper to the native confirm() method. 
    // The reason this is needed, is that firefox has a bug with modal views in some situations:
    // https://bytes.com/topic/javascript/answers/465001-modal-dialog-doesnt-threads-sleep-firefox
    // This factory returns a promise that will be "resolved" if the user agrees to the confirmation; or
    // will be "rejected" if the user cancels the confirmation.
    // Inspired from http://stackoverflow.com/questions/31848518/apply-already-in-progress-when-opening-confirm-dialog-box-with-firefox
    .factory("confirmDialog", function ($window, $q, $timeout) {

        // Define promise-based confirm() method.
        function confirm(message) {
            var defer = $q.defer();

            $timeout(function () {
                if ($window.confirm(message)) {
                    defer.resolve(true);
                }
                else {
                    defer.reject(false);
                }
            }, 0, false);
        
            return defer.promise;
        }

        return confirm;
    })
    
    .factory('Utils', function($q) {
        return {
            isImage: function(src) {
        
                var deferred = $q.defer();
        
                var image = new Image();
                image.onerror = function() {
                    deferred.resolve(false);
                };
                image.onload = function() {
                    deferred.resolve(true);
                };
                image.src = src;
        
                return deferred.promise;
            }
        };
    })
    ;