'use strict';


angular.module('mcp.organizations.service-specifications', [])

    .controller('CreateServiceSpecificationController', ['$scope', '$location','$stateParams',
        'ServiceSpecificationService', 'ServiceTypeService',
      function ($scope, $location, $stateParams, ServiceSpecificationService, ServiceTypeService) {

          $scope.serviceTypes = ServiceTypeService.query();
          $scope.organizationId = $stateParams.organizationId;
          $scope.serviceSpec = {
              serviceSpecificationId: null,
              organizationId: $stateParams.organizationId,
              name: null,
              summary: null
          };

          $scope.submit = function () {
              $scope.alertMessages = null;
              $scope.message = "Sending request to create organization...";

              $scope.busyPromise = ServiceSpecificationService.create($scope.serviceSpec,
                  function (data) {
                      $location.path('/orgs/' + $scope.organizationId).replace();
                  },
                  function (error) {
                      $scope.message = null;
                      $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                  }
              );
          };

          $scope.close = function () {
              $location.path('/orgs/' + $scope.organizationId).replace();
          };

          $scope.formIsSubmitable = function () {
              return ($scope.serviceSpec.name && $scope.serviceSpec.serviceSpecificationId &&
                        $scope.serviceSpec.serviceType  && !$scope.idAlreadyExist);
          };

          $scope.resolveUniqueId = function () {
              if (!angular.isDefined($scope.serviceSpec.serviceSpecificationId)) {
                  $scope.idAlreadyExist = false;
                  $scope.idNotDefined = true;
                  return;
              }
              $scope.idNotDefined = false;
              ServiceSpecificationService.exists({
                    serviceSpecificationId: $scope.serviceSpec.serviceSpecificationId
                },
                function (response) {
                      $scope.idAlreadyExist = response.result == 'true';
                });
          };

          $scope.$watch("serviceSpec.serviceSpecificationId",
              function (newValue, oldValue, scope) {
                  if (newValue !== oldValue) {
                      scope.resolveUniqueId();
                  }
              }
          );

      }])

    .controller('EditServiceSpecificationController', [
      '$scope', '$location', '$stateParams', 'ServiceSpecificationService', 'ServiceTypeService',
      function ($scope, $location, $stateParams, ServiceSpecificationService, ServiceTypeService) {

          $scope.serviceTypes = ServiceTypeService.query();
          $scope.organizationId = $stateParams.organizationId;
          $scope.serviceSpec = ServiceSpecificationService.get({
              serviceSpecificationId: $stateParams.serviceSpecificationId
          });

          $scope.submit = function () {
              $scope.alertMessages = null;
              $scope.message = "Sending request to update organization...";

              $scope.busyPromise = ServiceSpecificationService.update($scope.serviceSpec,
                  function (data) {
                      $location.path('/orgs/' + $scope.organizationId).replace();
                  },
                  function (error) {
                      $scope.message = null;
                      $scope.alertMessages = ["Error on the serverside: ", error.statusText, error.data.message];
                  }
              );
          };

          $scope.close = function () {
              $location.path('/orgs/' + $scope.organizationId).replace();
          };

          $scope.formIsSubmitable = function () {
              return ($scope.serviceSpec.name && $scope.serviceSpec.serviceType);
          };

      }])

    ;
