/*  Copyright 2016 Danish Maritime Authority.
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

/**
 * The Auth controller. Install it at all html pages that require authentication/authorization
 */
angular.module('mcp.auth')
    .controller('AuthCtrl', ['$scope', 'Auth',
        function ($scope, Auth) {
            'use strict';

            $scope.isLoggedIn = Auth.loggedIn;
            $scope.hasSiteRole = function (siteRole) {
                if (!angular.isArray(siteRole)) {
                    siteRole = [siteRole];
                }
//                return $rootScope.currentUser &&
//                    intersects($rootScope.currentUser.siteRoles, siteRole);
                // TODO for now user always has role
                return true;
              };

            /** Returns the user name ,**/
            $scope.userName = function () {
                if (Auth.keycloak.idTokenParsed) {
                    return Auth.keycloak.idTokenParsed.name || Auth.keycloak.idTokenParsed.preferred_username;
                }
                return undefined;
            };
            $scope.userName = $scope.userName();

            /** Logs the user in via Keycloak **/
            $scope.login = function () {
//            	de her skal ud i en service skal de ikk?
                Auth.keycloak.login();
            };

            /** Logs the user out via Keycloak **/
            $scope.logout = function () {
                Auth.keycloak.logout();
                Auth.loggedIn = false;
                Auth.keycloak = null;
            };

            /** Enters the Keycloak account management **/
            $scope.accountManagement = function () {
                Auth.keycloak.accountManagement();
            };
        }]);