/*  Copyright 2014 Danish Maritime Authority.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

angular.module('mcp.auth', ['ui.bootstrap', 'http-auth-interceptor', 'ngStorage'])


    /* Constants */

    // Authentication events broadcasted on rootScope
    .constant('AUTH_EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      loginCancelled: 'auth-login-cancelled',
      logoutSuccess: 'auth-logout-success',
      sessionTimeout: 'auth-session-timeout',
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
    })

    .constant('SITE_ROLES', {
      admin: 'admin',
      user: 'user'
    })

    .constant('ORG_ROLES', {
        admin: 'admin',
        user: 'user',
        applicant: 'applicant',
        invited: 'invited'
    })

    /* Controllers */

    // A container for global application logic
    .controller('ApplicationController', function ($rootScope, $scope, $modal, $location, $localStorage,
               SITE_ROLES, ORG_ROLES, AUTH_EVENTS, AuthService, httpAuthInterceptorService) {
      $scope.sidebar = {isMinified: false};
      $scope.orgRoles = ORG_ROLES;
      $scope.siteRoles = SITE_ROLES;
      $scope.hasSiteRole = AuthService.hasSiteRole;
      $scope.isLoggedIn = AuthService.isAuthenticated;
      $scope.hasOrganizationRole = AuthService.hasOrganizationRole;
      $scope.navigationTarget = null;
      $scope.message = null;
      $scope.mcpInfo = mcpInfo; // from "info.js"
      $scope.alertMessages = [];

      // Check if the user is authenticated
      AuthService.checkAuthenticated();

      // Login listener
      $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        // Process pending requests
        httpAuthInterceptorService.loginConfirmed();
        // Navigate to deferred page
        if ($scope.navigationTarget) {
          $location.path($scope.navigationTarget).replace();
          $scope.navigationTarget = null;
        }
      });

      // Logout listener that cleans up state bound to the current user
      $scope.$on(AUTH_EVENTS.logoutSuccess, function () {

        $scope.navigationTarget = null;
        $location.path('/').replace();
      });

      // Login listener that listens for login failure
      $scope.$on(AUTH_EVENTS.loginFailed, function () {
        console.log("User login failed!");
      });

      // Login listener that resets any pending requests if user cancels login
      $scope.$on(AUTH_EVENTS.loginCancelled, function () {
        //console.log("User login cancelled!");
        httpAuthInterceptorService.loginCancelled();
      });

      // Login listener that warns that user is not authorized for the action
      // ( broadcasted by app.js in case of page-transition to a page that 
      //   the user is not authorized to visit )
      $scope.$on(AUTH_EVENTS.notAuthorized, function () {
        console.log("User not authorized to visit this page!");
        $scope.alertMessages = ["User not authorized!"];
        $location.path('/').replace();
      });

      // Login listener that brings up the login dialog whenever the "event:auth-loginRequired!" event is fired
      $scope.$on('event:auth-loginRequired', function () {
        //console.log("event:auth-loginRequired!");
         AuthService.login();
      });

      $scope.$on(AUTH_EVENTS.notAuthenticated, function (event, targetRoute) {
        console.log("AUTH_EVENTS.notAuthenticated targetRoute: ", targetRoute, " event:", event);
        $scope.navigationTarget = targetRoute;
        AuthService.login(targetRoute);
      });

      $scope.login = function () {
        AuthService.login();
      };

      $scope.logout = function () {
        AuthService.logout();
      };

      $scope.editProfile = function () {
        AuthService.editProfile();
      };

    })


    /* Services */

    // AuthService
    // Service logic related to the remote authentication and authorization 
    .service('AuthService', function ($http, $rootScope, $timeout, $window, AUTH_EVENTS) {
      self = this;

      this.currentUser = function() {
            return $rootScope.currentUser;
      };

      this.isAuthenticated = function () {
        return $rootScope.currentUser !== undefined;
      };

      this.checkAuthenticated = function () {
        $http.get('/rest/auth/current-subject', {ignoreAuthModule: true})
            .then(function (respone) {
              var data = respone.data;
              if (data && !self.isAuthenticated()) {
                  $rootScope.currentUser = data;
                  $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
              } else if (!data && self.isAuthenticated()) {
                  $rootScope.currentUser = null;
                  $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
              }
            }, function () {
              console.error("Error checking authenticated")
            });
      };

      /* true, if user possess any of the mentioned roles */
      this.hasSiteRole = function (siteRole) {
        if (!angular.isArray(siteRole)) {
            siteRole = [siteRole];
        }
        return $rootScope.currentUser &&
            intersects($rootScope.currentUser.siteRoles, siteRole);
      };

      this.hasOrganizationRole = function (org, orgRole) {
        return $.inArray(orgRole, org.userRoles) != -1;
      };


      this.login = function (targetRoute) {
        if (!targetRoute) {
          targetRoute = '/app/index.html#/dashboard';
        }
        $window.location.href = '/rest/auth/oidc-login?targetUrl=' + encodeURIComponent(targetRoute);
      };

      this.logout = function () {
          //$rootScope.currentUser = null;
          //$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
          $timeout(function () {
              $window.location.href = '/rest/auth/auth-server-logout';
          }, 100);
      };

      this.editProfile = function () {
        $window.location.href = '/rest/auth/auth-server-account';
      };


      this.checkSiteRoles = function (roles, success, error) {
        $http.get("/rest/api/users/check-site-roles/" + roles.join())
            .success(success)
            .error(error);

      };

    });
