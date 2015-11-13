'use strict';
angular.module('mcp.users', ['ui.bootstrap'])

    .controller('UserListController', ['$scope', 'UserService',
      function ($scope, UserService) {
        $scope.pageSize = 20;
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.updateSearch = function () {
          $scope.busyPromise = UserService.query({size: $scope.pageSize, page: $scope.currentPage - 1, userPattern: $scope.filter_query}, function (page) {
            $scope.page = page;
            $scope.users = page.content;
          });
        };
        $scope.pageChanged = function () {
          $scope.updateSearch();
        };
        // load first page
        $scope.updateSearch();
      }])

    .controller('UserDetailController', ['$scope', '$stateParams', 'UserService',
      function ($scope, $stateParams, UserService) {
        UserService.get({userId: $stateParams.userId}, function (user) {
            $scope.user = user;
        });
      }])


    .directive('userListDetails', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
              user: "=",
              membership: "="
            },
            templateUrl: "users/user-list-details.html",
            link: function (scope, element, attrs) {
            }
        };
    })
    ;

