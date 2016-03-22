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
  'mcp.directives',
  'mcp.filters',
  'mcp.layout',
  'mcp.mapservices',
  'mcp.organizations',
  'mcp.organizations.members',
  'mcp.organizations.service-instances',
  'mcp.organizations.service-specifications',
  'mcp.search.services',
  'mcp.users',
  'mcp.vessels',
  'leaflet-directive'
]);

var applicationStartUrl = '/vessels';
var dateFormat = 'yyyy-MM-dd HH:mm:ss';

angular.element(document).ready(function () {
	bootstrapKeycloak('mcpApp', 'check-sso');
});

mcpApp
.config(['$httpProvider', '$stateProvider', 'stateHelperProvider', '$urlRouterProvider', 'SITE_ROLES',
  function($httpProvider, $stateProvider, stateHelperProvider, $urlRouterProvider, SITE_ROLES) {
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
        }
      ]
    };

    var restrictedArea = {
      name: 'restricted',
      templateUrl: 'layout/restricted.html',
      data: {
        authorizedRoles: [SITE_ROLES.admin, SITE_ROLES.user]
      },
      children: [
        {
          name: 'dashboard',
          url: "/dashboard",
          templateUrl: 'partials/dashboard.html',
          controller: 'DashboardController'
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
            url: "/vessels/{vesselId}",
            templateUrl: 'vessels/vessel-detail.html',
            controller: 'VesselDetailController'
        },
        {
            name: 'vesselEdit',
            url: "/vessels/{vesselId}/edit",
            templateUrl: 'vessels/vessel-edit.html',
            controller: 'VesselEditController'
        },
        { 
            name: 'generateCertificateVessel',
            url: "/certificates/generate/vessel/{vesselId}",
            templateUrl: 'certificates/certificate-generate-vessel.html',
            controller: 'CertificateVesselGenerateController'
        },
        {
          name: 'users',
          url: "/users",
          templateUrl: 'users/user-list.html',
          controller: 'UserListController'
        },
        {
          name: 'userDetails',
          url: "/users/{userId}",
          templateUrl: 'users/user-detail.html',
          controller: 'UserDetailController'
        },
        {
          name: 'searchOrganizations',
          url: "/orgs",
          templateUrl: 'organizations/organization-list.html',
          controller: 'OrganizationListController'
        },
        {
          name: 'organizationCreate',
          url: "/orgs/new",
          templateUrl: 'organizations/organization-create.html',
          controller: 'OrganizationCreateController'
        },
        {
          name: 'organizationDetails',
          url: "/orgs/{organizationId}",
          templateUrl: 'organizations/organization-detail.html',
          controller: 'OrganizationDetailsController'
        },
        {
          name: 'organizationSettings',
          url: "/orgs/{organizationId}/settings",
          templateUrl: 'organizations/organization-edit.html',
          controller: 'OrganizationEditController'
        },
        {
          name: 'organizationMembers',
          url: "/orgs/{organizationId}/members",
          templateUrl: 'organizations/members/member-list.html',
          controller: 'OrganizationMembersController'
        },
        {
          name: 'organizationMembersInvite',
          url: "/orgs/{organizationId}/members/invite",
          templateUrl: 'organizations/members/membership.html',
          controller: 'OrganizationInviteMemberController'
        },
        {
          name: 'organizationMembersJoin',
          url: "/orgs/{organizationId}/members/join",
          templateUrl: 'organizations/members/membership.html',
          controller: 'UserJoinOrganizationController'
        },
        {
          name: 'serviceInstanceCreate',
          url: "/orgs/{organizationId}/si/create",
          templateUrl: 'organizations/service-instances/service-instance-create.html',
          controller: 'CreateServiceInstanceController',
          data: {createState: true}
        },
        {
          name: 'serviceInstanceEdit',
          url: "/orgs/{organizationId}/si/{serviceInstanceId}/edit",
          templateUrl: 'organizations/service-instances/service-instance-edit.html',
          controller: 'EditServiceInstanceController',
          data: {editState: true}
        },
        {
          name: 'serviceInstanceMembers',
          url: "/orgs/{organizationId}/si/{serviceInstanceId}/members",
          templateUrl: 'organizations/service-instances/service-instance-members.html',
          controller: 'ServiceInstanceMembersController',
          data: {editState: true}
        },
        {
          name: 'serviceSpecificationCreate',
          url: "/orgs/{organizationId}/ss/create",
          templateUrl: 'organizations/service-specifications/service-specification-create.html',
          controller: 'CreateServiceSpecificationController',
          data: {createState: true}
        },
        {
          name: 'serviceSpecificationEdit',
          url: "/orgs/{organizationId}/ss/{serviceSpecificationId}/edit",
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
    .run(function($rootScope, $state, $location, AuthServ, Auth) {
        $rootScope.$on('$stateChangeStart', function(event, next, params) {

            if($rootScope.stateChangeBypass) {
                $rootScope.stateChangeBypass = false;
                return;
            }
            // If we are logged in and no route url is present, we will redirect to our start url
            if(next.url === '/' && Auth.loggedIn) {
                $rootScope.stateChangeBypass = true;
            	$location.path(applicationStartUrl);
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
    ;