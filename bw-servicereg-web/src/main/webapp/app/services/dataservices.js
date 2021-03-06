'use strict';

// --------------------------------------------------
/* Services */
// --------------------------------------------------

var mcpServices = angular.module('mcp.dataservices', ['ngResource'])

    .constant("servicePort", /*"8080"*/ null)
//    .constant("servicePortBackend", "8443")
    .constant("servicePortBackend", "443")
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
//        var protocol = 'http';
//        var host = 'localhost';
        var protocol = 'https';
        var host = 'api.maritimecloud.net';
        var port = servicePortBackend ? servicePortBackend : $location.port();
        return protocol + "://" + host + ":" + port;
      }])
      
    .factory('RoleService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
    	var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/role/:roleId', {}, {
    		post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {roleId: '@id'}, isArray: false},
            deleteR: {method: 'DELETE', params: {roleId: '@roleId'}, isArray: false},
            getRoles: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/roles', 
            	isArray: true
            },
            getMyRoles: {
            	method:'GET',
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/role/myroles', 
            	isArray: true
            }
        });
    	resource.update = function (role, succes, error) {
            return this.put(role, succes, error);
        };
        resource.create = function (role, succes, error) {
            return this.post(role, succes, error);
        };
        resource.deleteRole = function (roleId, succes, error) {
            return this.deleteR({roleId: roleId}, succes, error);
        };
    	return resource;
    }])
    
    .factory('DeviceService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
    	var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/device/:mrn', {}, {
    		post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {mrn: '@mrn'}, isArray: false},
            deleteD: {method: 'DELETE', params: {mrn: '@mrn'}, isArray: false},
            getDeviceList: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/devices', 
            	isArray: true
            },
            generateCertificate: {
                method: 'GET',
                params: {mrn: '@mrn'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/device/:mrn/certificate/issue-new'
            },
            revokeCertificate: {
                method: 'POST',
                params: {mrn: '@mrn', certId: '@certId'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/device/:mrn/certificate/:certId/revoke'
            }
        });

        resource.update = function (device, succes, error) {
            return this.put(device, succes, error);
        };
        resource.create = function (device, succes, error) {
            return this.post(device, succes, error);
        };
        resource.deleteDevice = function (mrn, succes, error) {
            return this.deleteD({mrn: mrn}, succes, error);
        };        
        resource.generateCertificateForDevice = function (mrn, succes, error) {
            return this.generateCertificate({mrn: mrn}, succes, error);
        };
        resource.revokeCertificateForDevice = function (mrn, certId, revokationReason, revokedAt, succes, error) {
            return this.revokeCertificate({mrn: mrn, certId: certId, revokationReason: revokationReason, revokedAt: revokedAt}, succes, error);
        };
    	return resource;
    }])
    
    .factory('ServiceIdentityService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
        var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/service/:mrn', {}, {
            post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {mrn: '@mrn'}, isArray: false},
            deleteS: {method: 'DELETE', params: {mrn: '@mrn'}, isArray: false},
            getServiceList: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/services', 
            	isArray: true
            },
            generateCertificate: {
                method: 'GET',
                params: {mrn: '@mrn'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/service/:mrn/certificate/issue-new'
            },
            revokeCertificate: {
                method: 'POST',
                params: {mrn: '@mrn', certId: '@certId'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/service/:mrn/certificate/:certId/revoke'
            }
        });

        resource.update = function (service, succes, error) {
            return this.put(service, succes, error);
        };
        resource.create = function (service, succes, error) {
            return this.post(service, succes, error);
        };
        resource.deleteService = function (mrn, succes, error) {
            return this.deleteS({mrn: mrn}, succes, error);
        };        
        resource.generateCertificateForService = function (mrn, succes, error) {
            return this.generateCertificate({mrn: mrn}, succes, error);
        };
        resource.revokeCertificateForService = function (mrn, certId, revokationReason, revokedAt, succes, error) {
            return this.revokeCertificate({mrn: mrn, certId: certId, revokationReason: revokationReason, revokedAt: revokedAt}, succes, error);
        };
        
        return resource;
      }])

    .factory('VesselService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
        var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/vessel/:mrn', {}, {
            post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {mrn: '@mrn'}, isArray: false},
            deleteV: {method: 'DELETE', params: {mrn: '@mrn'}, isArray: false},
            getVesselList: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/vessels', 
            	isArray: true
            },
            generateCertificate: {
                method: 'GET',
                params: {mrn: '@mrn'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/vessel/:mrn/certificate/issue-new'
            },
            revokeCertificate: {
                method: 'POST',
                params: {mrn: '@mrn', certId: '@certId'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/vessel/:mrn/certificate/:certId/revoke'
            }
        });

        resource.update = function (vessel, succes, error) {
            return this.put(vessel, succes, error);
        };
        resource.create = function (vessel, succes, error) {
            return this.post(vessel, succes, error);
        };
        resource.deleteVessel = function (mrn, succes, error) {
            return this.deleteV({mrn: mrn}, succes, error);
        };        
        resource.generateCertificateForVessel = function (mrn, succes, error) {
            return this.generateCertificate({mrn: mrn}, succes, error);
        };
        resource.revokeCertificateForVessel = function (mrn, certId, revokationReason, revokedAt, succes, error) {
            return this.revokeCertificate({mrn: mrn, certId: certId, revokationReason: revokationReason, revokedAt: revokedAt}, succes, error);
        };
        
        return resource;
      }])

    .factory('UserService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
    	var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/user/:mrn', {}, {
    		post: {method: 'POST', params: {}, isArray: false},
            put: {method: 'PUT', params: {mrn: '@mrn'}, isArray: false},
            deleteU: {method: 'DELETE', params: {mrn: '@mrn'}, isArray: false},
            getUserList: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/users', 
            	isArray: true
            },
            generateCertificate: {
                method: 'GET',
                params: {mrn: '@mrn'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/user/:mrn/certificate/issue-new'
            },
            revokeCertificate: {
                method: 'POST',
                params: {mrn: '@mrn', certId: '@certId'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/user/:mrn/certificate/:certId/revoke'
            }
        });

        resource.update = function (user, succes, error) {
            return this.put(user, succes, error);
        };
        resource.create = function (user, succes, error) {
            return this.post(user, succes, error);
        };
        resource.deleteUser = function (mrn, succes, error) {
            return this.deleteU({mrn: mrn}, succes, error);
        };        
        resource.generateCertificateForUser = function (mrn, succes, error) {
            return this.generateCertificate({mrn: mrn}, succes, error);
        };
        resource.revokeCertificateForUser = function (mrn, certId, revokationReason, revokedAt, succes, error) {
            return this.revokeCertificate({mrn: mrn, certId: certId, revokationReason: revokationReason, revokedAt: revokedAt}, succes, error);
        };
    	return resource;
    }])
    
    .factory('OrganizationService', ['$resource', 'serviceBaseUrlBackend', 'loginType', 'Auth', function ($resource, serviceBaseUrlBackend, loginType, Auth) {
        var resource = $resource(serviceBaseUrlBackend + '/' + loginType + '/api/org/:mrn', {}, {
            put: {method: 'PUT', params: {mrn: '@mrn'}},
            applyOrg: {method: 'POST', params: {mrn: '@mrn'}},
            getOrganizationList: {
            	method: 'GET', 
            	url: serviceBaseUrlBackend + '/' + loginType + '/api/orgs', 
            	isArray: true
            },
            applyOrg: {
                method: 'POST',
                params: {},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/apply'
            },
            generateCertificate: {
                method: 'GET',
                params: {},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/certificate/issue-new'
            },
            revokeCertificate: {
                method: 'POST',
                params: {certId: '@certId'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/' + encodeURIComponent(auth.org) + '/certificate/:certId/revoke'
            },
            uploadLog: {
                method: 'POST',
                params: {mrn: '@mrn'},
                url: serviceBaseUrlBackend + '/' + loginType + '/api/org/:mrn/logo',
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }
        });

        resource.update = function (organization, succes, error) {
            return this.put(organization, succes, error);
        };

        resource.apply = function (organization, succes, error) {
            return this.applyOrg(organization, succes, error);
        };

        resource.uploadLogo = function (mrn, FormData, succes, error) {
        	logoTimestamp = (new Date()).getTime();
            return this.uploadLog({mrn: mrn},FormData, succes, error);
        };
        resource.getLogo = function (mrn) {
            return serviceBaseUrlBackend + '/' + loginType + '/api/org/' + mrn + '/logo?t=' + logoTimestamp + '&Authorization=Bearer ' + Auth.keycloak.token;
        };
        
        resource.generateCertificateForOrganization = function (succes, error) {
            return this.generateCertificate(succes, error);
        };
        resource.revokeCertificateForOrganization = function (certId, revokationReason, revokedAt, succes, error) {
            return this.revokeCertificate({certId: certId, revokationReason: revokationReason, revokedAt: revokedAt}, succes, error);
        };

        return resource;
    }])
    
    .factory('UserOldService', ['$resource', 'serviceBaseUrl', function ($resource, serviceBaseUrl) {
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
    
    .factory('OrganizationOldService', ['$resource', 'serviceBaseUrl',
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
