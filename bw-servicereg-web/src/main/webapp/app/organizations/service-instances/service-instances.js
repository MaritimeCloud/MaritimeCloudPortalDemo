'use strict';

var fitToPaths = function fitToPaths(mapId, leafletData, mapService) {
    leafletData.getMap(mapId).then(function (map) {
        mapService.fitToGeomitryLayers(map);
    });
};

// FIXME move to a service or config or something
var servicetypeProtocols = {
    AISASM: ['ais:'],
    DGNSS: ['dgnss:'],
    FTP: ['ftp:'],
    EMAIL: ['mailto:'],
    HTTP: ['http://', 'https://'],
    MMS: ['mms:'],
    NAVTEX: ['navtex:'],
    REST: ['http://', 'https://'],
    SOAP: ['http://', 'https://'],
    TCP: ['tcp:'],
    TEL: ['tel:'],
    UDP: ['udp:'],
    VHF: ['vhf:'],
    WWW: ['http://', 'https://']
};

var indexOfUri = function (endpoints, endpointUri) {
    if (endpoints) {
        for (var i = 0; i < endpoints.length; i++) {
            if (endpoints[i].uri === endpointUri)
                return i;
        }
    }
    return -1;
};

angular.module('mcp.organizations.service-instances', [])


    .controller('ServiceInstanceDetailsController', ['$scope', 'ServiceSpecificationService', 'OrganizationService',
        function ($scope, ServiceSpecificationService, OrganizationService) {

            $scope.details = {isCollapsed: true};

            $scope.toggleDetails = function () {
                $scope.details.isCollapsed = !$scope.details.isCollapsed;
            };

            $scope.service.specification = ServiceSpecificationService.get({
                serviceSpecificationId: $scope.service.specificationId
            });

            $scope.service.provider = OrganizationService.get({
                organizationId: $scope.service.organizationId
            });
        }
    ])


    .controller('CreateServiceInstanceController', ['$scope', '$location', '$modal', '$stateParams',
        'OperationalServiceService', 'ServiceSpecificationService', 'ServiceInstanceService',
        function ($scope, $location, $modal, $stateParams,
                 OperationalServiceService, ServiceSpecificationService, ServiceInstanceService) {

            var reportError = function (error) {
                $scope.message = null;
                $scope.alertMessages = ["Error on the server-side :( ", error];
            };

            $scope.message = null;
            $scope.alertMessages = null;
            $scope.selection = {
                    operationalService: null,
                    specification: null
                };
            $scope.operationalServices = OperationalServiceService.query();
            $scope.service = {
                    serviceInstanceId: null,
                    organizationId: $stateParams.organizationId,
                    name: null,
                    summary: null,
                    coverage: [],
                    endpoints: []
                };

            // this property is referenced by the "thumbnail-map"-directive!
            $scope.services = [$scope.service];
            $scope.map = {}; // this property is populated with methods by the "thumbnail-map"-directive!!!

            $scope.protocol = "<select a specification type>";


            $scope.selectOperationalService = function (selectedOperationalService) {
                $scope.specifications = selectedOperationalService
                    ? ServiceSpecificationService.query(
                        {operationalServiceId: selectedOperationalService.operationalServiceId}, function (data) {
                            // is not in list then reset
                            $scope.selection.specification = null;
                        })
                    : [];
            };

            $scope.setServiceTypeProtocol = function (serviceSpecification) {
                if (serviceSpecification) {
                    $scope.protocols = servicetypeProtocols[serviceSpecification.serviceType];
                    $scope.protocol = servicetypeProtocols[serviceSpecification.serviceType][0];
                }
            };

            $scope.isLockedOrInvalidEndpoint = function (newEndpoint) {
                var protocol = $scope.protocol;

                var b = !($scope.selection.specification)
                    || !newEndpoint
                    || newEndpoint.trim().length === 0
                    || indexOfUri($scope.service.endpoints, protocol + newEndpoint) >= 0;
                return b;
            };

            $scope.addEndpoint = function (newEndpointUri) {
                var protocol = $scope.protocol;
                $scope.service.endpoints.push({uri: protocol + newEndpointUri});
            };

            $scope.removeEndpoint = function (endpointUri) {
                var index = indexOfUri($scope.service.endpoints, endpointUri);
                if (index >= 0) {
                    $scope.service.endpoints.splice(index, 1);
                }
            };

            $scope.openCoverageEditor = function () {
                $modal.open({
                    templateUrl: 'organizations/service-instances/coverage-editor.html',
                    controller: 'CoverageEditorController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        coverage: function () {
                            return $scope.service.coverage;
                        },
                        mapOptions: function () {
                            return {bounds: $scope.map.handle.getBounds()};
                        }
                    }
                }).result.then(function (result) {
                    // submit
                    $scope.service.coverage = result;
                    $scope.map.rebuild();
                }, function () {
                    // dismiss
                });
            };

            $scope.close = function (result) {
                $location.path('/orgs/' + $scope.service.organizationId).replace();
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to register service instance...";

                $scope.service.specificationId = $scope.selection.specification.serviceSpecificationId;
                // Create instance
                ServiceInstanceService.create($scope.service, function () {
                        $scope.close();
                    },
                    reportError);
            };

            $scope.formIsSubmitable = function () {
                return ($scope.service.serviceInstanceId && $scope.service.name && !$scope.idAlreadyExist);
            };

            $scope.resolveUniqueId = function () {
                if (!angular.isDefined($scope.service.serviceInstanceId)) {
                    $scope.idAlreadyExist = false;
                    $scope.idNotDefined = true;
                    return;
                }
                $scope.idNotDefined = false;
                ServiceInstanceService.exists({
                        serviceInstanceId: $scope.service.serviceInstanceId
                    },
                    function (response) {
                        $scope.idAlreadyExist = response.result == 'true';
                    });
            };

            $scope.$watch("service.serviceInstanceId",
                function (newValue, oldValue, scope) {
                    if (newValue !== oldValue) {
                        scope.resolveUniqueId();
                    }
                }
            );

        }])


    .controller('EditServiceInstanceController', [
        '$scope', '$location', '$modal', '$stateParams', 'ServiceSpecificationService', 'ServiceInstanceService',
        function ($scope, $location, $modal, $stateParams, ServiceSpecificationService, ServiceInstanceService) {

            var reportError = function (error) {
                $scope.message = null;
                $scope.alertMessages = ["Error on the serverside :( ", error];
            };

            $scope.map = {}; // this property is populated with methods by the "thumbnail-map"-directive!!!
            $scope.services = []; // this property is referenced by the "thumbnail-map"-directive!!!
            $scope.message = null;
            $scope.alertMessages = null;
            $scope.protocol = "<select a specification type>";
            $scope.specification = null;

            $scope.service = ServiceInstanceService.get(
                { serviceInstanceId: $stateParams.serviceInstanceId },
                function (serviceInstance) {

                    // "hydrate" ServiceInstance with ServiceSpecification data
                    ServiceSpecificationService.get(
                        {serviceSpecificationId: serviceInstance.specificationId},
                        function (serviceSpecification) {
                            $scope.specification = serviceSpecification;

                            $scope.services.push(serviceInstance);
                            // rebuild the map once the request has returned the serviceInstance
                            $scope.map.rebuild();

                            if ($scope.specification) {
                                $scope.protocols = servicetypeProtocols[serviceSpecification.serviceType];
                                $scope.protocol = servicetypeProtocols[serviceSpecification.serviceType][0];
                            }
                        });

                }, reportError);

            $scope.formIsSubmitable = function () {
                return ($scope.service.serviceInstanceId && $scope.service.name /*&& $scope.service.coverage*/);
            };

            $scope.isLockedOrInvalidEndpoint = function (newEndpoint) {
                var protocol = $scope.protocol;

                var b = !newEndpoint
                    || newEndpoint.trim().length === 0
                    || indexOfUri($scope.service.endpoints, protocol + newEndpoint) >= 0;
                return b;
            };

            $scope.addEndpoint = function (newEndpointUri) {
                var protocol = $scope.protocol;
                $scope.service.endpoints.push({uri: protocol + newEndpointUri});
            };

            $scope.removeEndpoint = function (endpointUri) {
                var index = indexOfUri($scope.service.endpoints, endpointUri);
                if (index >= 0) {
                    $scope.service.endpoints.splice(index, 1);
                }
            };

            $scope.openCoverageEditor = function () {
                $modal.open({
                    templateUrl: 'organizations/service-instances/coverage-editor.html',
                    controller: 'CoverageEditorController',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        coverage: function () {
                            return $scope.service.coverage;
                        },
                        mapOptions: function () {
                            return {bounds: $scope.map.handle.getBounds()};
                        }
                    }
                }).result.then(function (result) {
                    // submit
                    $scope.service.coverage = result;
                    $scope.map.rebuild();
                });
            };

            $scope.close = function () {
                $location.path('/orgs/' + $scope.service.organizationId).replace();
            };

            $scope.submit = function () {
                $scope.alertMessages = null;
                $scope.message = "Sending request to register service instance...";

                ServiceInstanceService.update($scope.service, function () {
                    $scope.close();
                }, reportError);
            };

        }])


    .controller('ServiceInstanceMembersController', [
        '$scope', '$location', '$modal', '$stateParams',
            'ServiceSpecificationService', 'ServiceInstanceService', 'UserService', 'OrganizationService',
        function ($scope, $location, $modal, $stateParams,
                  ServiceSpecificationService, ServiceInstanceService, UserService, OrganizationService) {

            var reportError = function (error) {
                $scope.message = null;
                $scope.alertMessages = ["Error on the server side :( ", error];
            };

            $scope.membersOrderProp = "userId";
            $scope.members = [];
            $scope.roles = [];
            $scope.viewState = 'list';

            $scope.peopleOrderProp = "userId";
            $scope.orgOrderProp = "organizationId";
            $scope.roleSelection = { role: '' };
            $scope.userQuery = '';
            $scope.orgQuery = '';
            $scope.people = [];
            $scope.organizations = [];
            $scope.peoplePage = 0;
            $scope.orgPage = 0;

            $scope.updateServiceRoles = function (members) {
                $scope.roles.length = 0;
                $.each(members, function (i1, member) {
                    if (member.serviceRoles) {
                        $.each(member.serviceRoles, function (i2, role) {
                            if ($.inArray(role, $scope.roles) == -1) {
                                $scope.roles.push(role);
                            }
                        })
                    }
                });
            };

            $scope.loadMembers = function () {
                $scope.members.length = 0;
                $scope.members = ServiceInstanceService.members(
                    { serviceInstanceId: $stateParams.serviceInstanceId },
                    $scope.updateServiceRoles);
            };

            $scope.service = ServiceInstanceService.get(
                { serviceInstanceId: $stateParams.serviceInstanceId },
                $scope.loadMembers, reportError);

            $scope.hasServiceRole = function (member, role) {
                return member && $.inArray(role, member.serviceRoles) != -1;
            };

            $scope.backToService = function () {
                $location.path('/orgs/' + $scope.service.organizationId).replace();
            };

            $scope.isCurrentUser = function (member) {
                return member.userId === $scope.currentUser.userId;
            };

            $scope.showMembers = function () {
                $scope.viewState = 'list';
                $scope.loadMembers();
            };

            $scope.showInviteMember = function () {
                $scope.userQuery = '';
                $scope.orgQuery = '';
                $scope.roleSelection.role = '';
                $scope.people = [];
                $scope.organizations = [];
                $scope.peoplePage = 0;
                $scope.viewState = 'invite';
            };

            $scope.isNewMember = function (user) {
                for (var i = 0; i < $scope.members.length; i++) {
                    if (user.userId === $scope.members[i].userId) {
                        return false;
                    }
                }
                return true;
            };

            $scope.updatePeopleSearch = function (pattern) {
                if (pattern && pattern.trim().length > 0) {
                    $scope.busyPromiseSearch = UserService.query({userPattern: pattern, size: 10}, function (page) {
                        $scope.peoplePage = page;
                        $scope.people = page.content;
                    }).$promise;
                } else {
                    $scope.peoplePage = null;
                    $scope.people = [];
                }
            };

            $scope.updateOrganizationSearch = function (pattern) {
                if (pattern && pattern.trim().length > 0) {
                    $scope.busyPromiseSearch = OrganizationService.query({namePattern: pattern, size: 10}, function (organizations) {
                        $scope.organizations = organizations;
                    }).$promise;
                } else {
                    $scope.organizations = [];
                }
            };

            $scope.assignRole = function (userId, role) {
                ServiceInstanceService.updateRole($scope.service, userId, role, 'assign',
                    $scope.loadMembers,
                    reportError);
            };

            $scope.removeRole = function (userId, role) {
                ServiceInstanceService.updateRole($scope.service, userId, role, 'remove',
                    $scope.loadMembers,
                    reportError);
            };

            $scope.assignOrgRole = function (organizationId, role) {
                ServiceInstanceService.updateOrgRole($scope.service, organizationId, role, 'assign',
                    $scope.loadMembers,
                    reportError);
            };

        }])


    .controller('CoverageEditorController', ['$scope', 'leafletData', 'mapService', 'coverage', 'mapOptions',
        function ($scope, leafletData, mapService, coverage, mapOptions) {

            var options = mapService.createDrawingOptions(),
                drawControl = new L.Control.Draw(options),
                serviceLayer = options.edit.featureGroup;

            $scope.center = {
                lat: 51,
                lng: 0,
                zoom: 4
            };
            $scope.controls = {
                custom: [drawControl]
            };
            $scope.latlongs = [];

            // convert supplied coverage shapes to layers
            mapService.shapesToLayers(coverage).forEach(function (layer) {
                serviceLayer.addLayer(layer);
            });

            // add layers to map and add a draw-listener
            leafletData.getMap("coverageEditorMap").then(function (map) {
                map.addLayer(serviceLayer);
                serviceLayer.setStyle(mapService.Styles.STATIC);

                if (coverage.length) {
                    mapService.fitToGeomitryLayers(map);
                } else if (mapOptions.bounds) {
                    map.fitBounds(mapOptions.bounds);
                }

                map.on('draw:created', function (e) {
                    var layer = e.layer;
                    serviceLayer.addLayer(layer);
                });
            });

            $scope.formIsSubmitable = function () {
                return (serviceLayer.getLayers().length);
            };

            $scope.submit = function () {
                $scope.$close(mapService.layersToShapes(serviceLayer.getLayers()));
            };

        }])
;
