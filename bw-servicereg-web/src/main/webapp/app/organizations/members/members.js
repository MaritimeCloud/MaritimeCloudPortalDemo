'use strict';

/* Controllers */

angular.module('mcp.organizations.members', ['ui.bootstrap'])

    .controller('OrganizationMembersController', ['$scope', '$stateParams', 'OrganizationService', 'ORG_ROLES',
      function ($scope, $stateParams, OrganizationService, ORG_ROLES) {

        $scope.organizationId = $stateParams.organizationId;
        $scope.members = [];
        $scope.memberCount = 0;
        $scope.orderProp = 'userId';

        $scope.loadMembers = function () {
            OrganizationService.membershipQuery({ organizationId: $scope.organizationId }, function (members) {
                $scope.members = members;
                for (var m in members) {
                    var user = members[m];
                    if (user.userId == $scope.currentUser.userId) {
                        $scope.currentMember = user;
                    }
                }
            });
            OrganizationService.membershipCount({ organizationId: $scope.organizationId }, function (count) {
                $scope.memberCount = count.membersCount;
            });
        };

        $scope.isCurrentUser = function (member) {
          return member.userId === $scope.currentUser.userId;
        };

        $scope.hasOrganizationRole = function (member, orgRole) {
            return member && $.inArray(orgRole, member.organizationRoles) != -1;
        };

        $scope.isMember = function () {
          return $scope.currentMember && $scope.currentMember.organizationRoles.length > 0;
        };

        $scope.isAdmin = function () {
          return $scope.hasSiteRole($scope.siteRoles.admin) || $scope.hasOrganizationRole($scope.currentMember, $scope.orgRoles.admin);
        };

        $scope.viewState = 'list';
        $scope.loadMembers();

        $scope.confirmRemove = function (userId) {
          $scope.viewState = 'confirm-remove';
          $scope.selectedMember = userId;
        };

        $scope.confirmLeave = function () {
              $scope.viewState = 'confirm-leave';
              $scope.selectedMember = $scope.currentUser;
        };

        $scope.cancel = function () {
          $scope.viewState = 'list';
          $scope.selectedMember = null;
          $scope.loadMembers();
        };

        $scope.remove = function () {
          OrganizationService.updateRole($scope.organization, $scope.selectedMember.userId, ORG_ROLES.user, 'remove',
              function() { $scope.loadMembers(); $scope.viewState = 'remove-success'; },
              function () { $scope.viewState = 'remove-failed'; });
        };

        $scope.leave = function () {
          OrganizationService.updateRole($scope.organization, $scope.selectedMember.userId, ORG_ROLES.user, 'remove',
              function() { $scope.loadMembers(); $scope.viewState = 'leave-success'; },
              function () { $scope.viewState = 'leave-failed'; });
        };

        $scope.acceptApplication = function (userId) {
          OrganizationService.updateRole($scope.organization, userId, ORG_ROLES.applicant, 'accept',
              function() { $scope.loadMembers() },
              function (error) { console.error("Error accepting application " + error); })
        };

        $scope.rejectApplication = function (userId) {
          OrganizationService.updateRole($scope.organization, userId, ORG_ROLES.applicant, 'reject',
              function() { $scope.loadMembers() },
              function (error) { console.error("Error cancelling application " + error); })
        };

        $scope.acceptInvitation = function (userId) {
          OrganizationService.updateRole($scope.organization, userId, ORG_ROLES.invited, 'accept',
              function() { $scope.loadMembers() },
              function (error) { console.error("Error accepting invitation " + error); })
        };

        $scope.rejectInvitation = function (userId) {
          OrganizationService.updateRole($scope.organization, userId, ORG_ROLES.invited, 'reject',
              function() { $scope.loadMembers() },
              function (error) { console.error("Error rejecting invitation " + error); })
        };

        $scope.assignRole = function (userId, role) {
          OrganizationService.updateRole($scope.organization, userId, role, 'assign',
              function() { $scope.loadMembers(); },
              function (error) { console.error("Error assigning role " + error); })
        };

        $scope.removeRole = function (userId, role) {
          OrganizationService.updateRole($scope.organization, userId, role, 'remove',
              function() { $scope.loadMembers(); },
              function (error) { console.error("Error assigning role " + error);})
        }
      }])


    .controller('OrganizationInviteMemberController', ['$scope', '$stateParams', 'UserOldService', 'OrganizationService', 'ORG_ROLES',
      function ($scope, $stateParams, UserOldService, OrganizationService, ORG_ROLES) {

        $scope.filter_query = '';
        $scope.viewState = 'invite';
        $scope.orderProp = 'userId';

        OrganizationService.get({organizationId: $stateParams.organizationId}, function (organization) {
              $scope.organization = organization;
        });

        OrganizationService.membershipQuery({ organizationId: $stateParams.organizationId }, function (members) {
            $scope.members = members;
        });

        $scope.isNewMember = function (user) {
          for (var i = 0; i < $scope.members.length; i++) {
            if (user.userId === $scope.members[i].userId) {
              return false;
            }
          }
          return true;
        };

        $scope.updateSearch = function (pattern) {
          if (pattern.trim().length > 0) {
            $scope.busyPromiseSearch = UserOldService.query({userPattern: pattern, size: 10}, function (page) {
              $scope.page = page;
              $scope.people = page.content;
            }).$promise;
          } else {
            $scope.page = null;
            $scope.people = [];
          }
        };

        $scope.confirm = function (member) {
          $scope.invitedMember = member;
          $scope.viewState = 'invite-confirm';
        };

        $scope.invite = function (member) {
            OrganizationService.updateRole($scope.organization, member, ORG_ROLES.invited, 'assign',
                function() { $scope.viewState = 'invite-success'; },
                function () { $scope.viewState = 'error'; });
        };
      }])

    .controller('UserJoinOrganizationController', ['$scope', '$stateParams', 'OrganizationService', 'ORG_ROLES',
      function ($scope, $stateParams, OrganizationService, ORG_ROLES) {
        $scope.viewState = 'apply-form';
        $scope.organization = OrganizationService.get({organizationId: $stateParams.organizationId});
        $scope.join = function (addtionalMessage) {

            OrganizationService.updateRoleWithMessage(
                $scope.organization,
                $scope.currentUser.userId,
                ORG_ROLES.applicant,
                'assign',
                !addtionalMessage ? "" : addtionalMessage,
                function() { $scope.viewState = 'apply-success'; },
                function () { $scope.viewState = 'error'; });

        };
      }])

    ;

