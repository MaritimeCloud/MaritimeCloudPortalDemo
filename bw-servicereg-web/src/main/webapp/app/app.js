'use strict';

/* App Module */

var mcpApp = angular.module('mcpApp', [
  'ui.router',
  'ui.router.stateHelper',
  'ui.select',
  'ngSanitize',
  'angularMoment',
  'mcp.auth',
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
  'leaflet-directive'
]);

mcpApp.config(['$stateProvider', 'stateHelperProvider', '$urlRouterProvider', 'SITE_ROLES',
  function($stateProvider, stateHelperProvider, $urlRouterProvider, SITE_ROLES) {
    $urlRouterProvider.when("", "/");

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
    .run(function($rootScope, $state, $location, AUTH_EVENTS, AuthService) {
      $rootScope.$on('$stateChangeStart', function(event, next, params) {

        if($rootScope.stateChangeBypass) {
          $rootScope.stateChangeBypass = false;
          return;
        }

        var isRestrictedRoute = next.data && next.data.authorizedRoles;

        if (isRestrictedRoute) {

          event.preventDefault();

          var targetUrl = window.location.pathname + "#" + next.url;

          AuthService.checkSiteRoles(
              next.data.authorizedRoles,
              function (data) {
                if (data == 'true') {
                  $rootScope.stateChangeBypass = true;
                  $state.go(next, params);
                } else {
                  console.error("Restriced Route Access: user is not authorized" + data)
                  $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                }
              },
              function (data) {
                console.log("Restriced Route Access: user is not logged in", next);
                //CB todo: nextRoute must be defined again after transition to ui-route
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, targetUrl);
              });
        }
      });

    });

