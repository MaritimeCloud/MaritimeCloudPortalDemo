'use strict';

// --------------------------------------------------
/* Services */
// --------------------------------------------------

var mcpServices = angular.module('mcp.dataservices', ['ngResource'])

    .constant("servicePort", /*"8080"*/ null)
    .constant("servicePortBackend", "8443")
    .constant("loginType", "oidc")
    
    .factory('serviceBaseUrl', ['$location', 'servicePort',
      function ($location, servicePort) {
        var protocol = $location.protocol();
        var host = $location.host();
        var port = servicePort ? servicePort : $location.port();
        return protocol + "://" + host + ":" + port;
      }])
      
    .factory('serviceBaseUrlBackend', ['$location', 'servicePortBackend',
      function ($location, servicePortBackend) {
        var protocol = 'http';
        var host = 'localhost';
        var port = servicePortBackend ? servicePortBackend : $location.port();
        return protocol + "://" + host + ":" + port;
      }])

    .factory('VesselService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
        var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + auth.org + '/vessel/:vesselId', {}, {
        	query: {method: 'GET', params: {userId: ''}, isArray: false},
            count: {method: 'GET', params: {userId: 'count'}, isArray: false},
            post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {}, isArray: false},
            getVesselList: {method: 'GET', url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + auth.org + '/vessels', isArray: true}
        });

          return resource;
        }])

    .factory('UserService', ['$resource', 'serviceBaseUrl', function ($resource, serviceBaseUrl) {
    	var resource = $resource(serviceBaseUrl + '/rest/api/users/:userId', {}, {
    		query: {method: 'GET', params: {userId: ''}, isArray: false},
            count: {method: 'GET', params: {userId: 'count'}, isArray: false},
            post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {}, isArray: false},
            queryUserMemberOrganizations: {method: 'GET', url: '/rest/api/users/:userId/member-organizations', isArray: true},
            queryUserOrganizations: {method: 'GET', url: '/rest/api/users/:userId/organizations', isArray: true}
        });
    	return resource;
    }])

    .factory('OrganizationService', ['$resource', 'serviceBaseUrl',
      function ($resource, serviceBaseUrl) {
        var resource = $resource(serviceBaseUrl + '/rest/api/org/:organizationId', {}, {
          post: {method: 'POST'},
          put: {method: 'PUT', params: {organizationId: '@organizationId.identifier'}},
          membershipQuery: {method: 'GET', url: serviceBaseUrl + '/rest/api/org/:organizationId/member', isArray: true },
          membership: {method: 'POST', params: {},
            url: serviceBaseUrl + '/rest/api/org/:organizationId/member'
          },
          membershipPut: {method: 'PUT', params: {},
            url: serviceBaseUrl + '/rest/api/org/:organizationId/member'
          },
          membershipCount: {method: 'GET', url: serviceBaseUrl + '/rest/api/org/:organizationId/member/count' },
          exists: {method: 'GET', params: {},
            url: serviceBaseUrl + '/rest/api/org/:organizationId/exists',
            transformResponse: function(data) {
                return {result: data};
            }
          },
          roleUpdate: {method: 'PUT', params: { organizationId: '@organizationId' },
            url: serviceBaseUrl + '/rest/api/org/:organizationId/role'
          }
        });

        resource.create = function (organization, succes, error) {
          return this.post(organization, succes, error);
        };

        resource.update = function (organization, succes, error) {
          return this.put(organization, succes, error);
        };

        resource.updateRole = function (organization, userId, role, update, success, error) {
          return this.roleUpdate({ organizationId: organization.organizationId, userId: userId, role: role, update: update }, success, error)
        };

        resource.updateRoleWithMessage = function (organization, userId, role, update, message, success, error) {
          return this.roleUpdate({ organizationId: organization.organizationId, userId: userId, role: role, message: message, update: update }, success, error)
        };

        return resource;
      }])

    .factory('ServiceStatsService', ['$resource', 'serviceBaseUrl',
      function ($resource, serviceBaseUrl) {
        return $resource(serviceBaseUrl + '/rest/api/stats');
      }])


    .factory('OperationalServiceService', ['$resource', 'serviceBaseUrl',
      function ($resource, serviceBaseUrl) {
        return $resource(serviceBaseUrl + '/rest/api/operational-service/:operationalServiceId');
      }])

    .factory('ServiceTypeService', ['$resource', 'serviceBaseUrl',
        function ($resource, serviceBaseUrl) {
            return $resource(serviceBaseUrl + '/rest/api/service-types');
        }])

    .factory('ServiceSpecificationService', ['$resource', 'serviceBaseUrl',
      function ($resource, serviceBaseUrl) {
          var resource = $resource(serviceBaseUrl + '/rest/api/service-specification/:serviceSpecificationId', {},
              {
                  post: {method: 'POST'},
                  put: {method: 'PUT'},
                  exists: {method: 'GET', params: {},
                      url: serviceBaseUrl + '/rest/api/service-specification/:serviceSpecificationId/exists',
                      transformResponse: function(data) {
                          return {result: data};
                      }
                  }
              }
          );

          resource.create = function (serviceSpec, succes, error) {
              return this.post(serviceSpec, succes, error);
          };

          resource.update = function (serviceSpec, succes, error) {
              return this.put(serviceSpec, succes, error);
          };

          return resource;
      }])

    .factory('ServiceInstanceService', ['$resource', 'serviceBaseUrl',
      function ($resource, serviceBaseUrl) {

        var resource = $resource(serviceBaseUrl + '/rest/api/service-instance/:serviceInstanceId', {},
            {
                post: {method: 'POST'},
                put: {method: 'PUT'},
                exists: {method: 'GET', params: {},
                    url: serviceBaseUrl + '/rest/api/service-instance/:serviceInstanceId/exists',
                    transformResponse: function(data) {
                        return {result: data};
                    }
                },
                members: {
                    method: 'GET',
                    params: {},
                    url: serviceBaseUrl + '/rest/api/service-instance/:serviceInstanceId/member',
                    isArray: true
                },
                roleUpdate: {
                    method: 'PUT',
                    params: { serviceInstanceId: '@serviceInstanceId' },
                    url: serviceBaseUrl + '/rest/api/service-instance/:serviceInstanceId/role'
                }

            });

          resource.create = function (serviceInstance, succes, error) {
              return this.post(serviceInstance, succes, error);
          };

          resource.update = function (serviceInstance, succes, error) {
              return this.put(serviceInstance, succes, error);
          };

          resource.updateRole = function (serviceInstance, userId, role, update, success, error) {
              return this.roleUpdate({ serviceInstanceId: serviceInstance.serviceInstanceId, userId: userId, role: role, update: update }, success, error)
          };

          resource.updateOrgRole = function (serviceInstance, organizationId, role, update, success, error) {
              return this.roleUpdate({ serviceInstanceId: serviceInstance.serviceInstanceId, organizationId: organizationId, role: role, update: update }, success, error)
          };

          return resource;
      }]);
