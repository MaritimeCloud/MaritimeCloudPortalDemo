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

angular.module('mcp.auth', ['ui.bootstrap', 'ngStorage'])
    .factory('AuthServ', function(Auth) {
        return {
            hasRole: function (roles, success, error) {
            	if (Auth.loggedIn) {
            		success(true);
            	} else {
            		error();
            	}
          }
        };
    })
    /**
     * Interceptor that adds a Keycloak access token to the requests as an authorization header.
     */
    .factory('authHttpInterceptor', function($q, Auth, $location) {
    	var failedRefresh = false;
        return {
            'request': function(config) {
                var deferred = $q.defer();
            	failedRefresh = false;
                if (Auth.keycloak.token) {
                    Auth.keycloak.updateToken(60).success(function() {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'Bearer ' + Auth.keycloak.token;
                        deferred.resolve(config);
                    }).error(function() {
                    	failedRefresh = true;
                        deferred.reject('Failed to refresh token');
                    });
                } else {
                    // Not authenticated - leave it to the server to fail
                    deferred.resolve(config);
                }
                return deferred.promise;
            },
            'responseError': function(response) { // TODO error handling
                if (response.status == 401) {
                    console.error('session timeout?');
                    Auth.keycloak.logout();
                } else if (response.status == 403) {
                    console.error('Forbidden');
                } else if (response.status == 404) {
                    console.error('Not found');
                } else if (response.status) {
                    if (response.data && response.data.errorMessage) {
                        console.error(response.data.errorMessage);
                    } else {
                        console.error("An unexpected server error has occurred " + response.status);
                    }
                }
                if(failedRefresh) {
                    Auth.keycloak.logout();
                    $location.path("/");
                }
                return $q.reject(response);
            }
        };
    });
    
    var auth = {};

    /**
     * Will bootstrap Keycloak and register the "Auth" service
     * @param angularAppName the angular modules
     */
    function bootstrapKeycloak(angularAppName, onLoad) {
        var keycloak = new Keycloak('/keycloak.json');
        auth.loggedIn = false;

        var initProps = {};
        if (onLoad) {
            initProps.onLoad = onLoad;
        }

        keycloak.init(initProps)
        .success(function (authenticated) {
            auth.loggedIn = authenticated;
            auth.keycloak = keycloak;
            auth.permissions = "MCUSER";
            if (keycloak.tokenParsed && keycloak.tokenParsed.org) {
                auth.org = keycloak.tokenParsed.org;
                
            } else {
            	// TODO error handling
            	auth.org = 'NO_ORG';
            }

            // Register the Auth factory
            mcpApp.factory('Auth', function() {
                return auth;
            });

            angular.bootstrap(document, [ angularAppName ]);

        }).error(function () {
            window.location.reload();
        });
    }