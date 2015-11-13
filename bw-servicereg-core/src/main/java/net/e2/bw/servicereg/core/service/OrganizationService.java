/* Copyright (c) 2011 Danish Maritime Authority
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */
package net.e2.bw.servicereg.core.service;

import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.UserOrganization;
import net.e2.bw.servicereg.model.Organization;

import java.util.List;

/**
 * Main organization service definition
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public interface OrganizationService {

    /**
     * Returns the organization with the given id
     *
     * @param organizationId the ID of the organization to look up
     * @return the organization or null if not found
     */
    Organization getOrganization(String organizationId);

    /**
     * Returns the PNG logo associated with the organization or null if not found
     *
     * @param organizationId the organization id
     * @return the PNG logo or null if undefined
     */
    byte[] getOrganizationLogo(String organizationId);

    /**
     * Returns all organizations
     *
     * @return all organizations
     */
    default List<Organization> getOrganizations() {
        return searchOrganizations(null);
    }

    /**
     * Search for all organizations matching the given search term
     *
     * @param searchTerm the search term
     * @return the result
     */
    List<Organization> searchOrganizations(String searchTerm);

    /**
     * Returns a specific organization.
     * The organization will list the users roles in the organization.
     *
     * @param organizationId the id of the organization
     * @param userId the id of the user
     * @return all organizations that the given user is member of
     */
    UserOrganization getUserOrganization(String organizationId, String userId);

    /**
     * Returns all organizations that the given user is member of.
     * Each organization will list the users roles in the organization.
     *
     * @param userId the id of the user
     * @return all organizations that the given user is member of
     */
    List<UserOrganization> getUserMemberOrganizations(String userId);

    /**
     * Returns all organizations that the given user can access.
     * Each organization will list the users roles in the organization.
     *
     * @param userId the id of the user
     * @return all organizations that the given user can access
     */
    List<UserOrganization> getUserOrganizations(String userId);

    /**
     * Returns the users that are members of the given organization.
     * The users will have their "organizationRoles" updated.
     *
     * @param organizationId the id of the organization
     * @return the list of members
     */
    List<AuthorizedUser> getOrganizationUsers(String organizationId);

    /**
     * Assigns the given organization role to the user. If the user is not already member of the
     * organization, she will be made a member.
     *
     * @param organizationId the id of the organization
     * @param userId the id of the user
     * @param role the organization role to assign
     */
    void assignOrganizationRole(String organizationId, String userId, String role);

    /**
     * Removes the given organization role from the user.
     * The removeAsMember parameter flags whether to remove the user as an organization member as well.
     *
     * @param organizationId the id of the organization
     * @param userId the id of the user
     * @param role the organization role to remove
     * @param removeAsMember whether to remove the user as a group member as well
     */
    void removeOrganizationRole(String organizationId, String userId, String role, boolean removeAsMember);

    /**
     * Leaves the organization and removes all organization roles from the user.
     *
     * @param organizationId the id of the organization
     * @param userId the id of the user
     */
    void leaveOrganization(String organizationId, String userId);

    /**
     * Creates a new organization based on the organization template.
     * The user that created the organization will become an administrator
     *
     * @param organization the organization template
     * @param userId the user that created the organization, will become an administrator
     * @return the newly created organization
     */
    Organization createOrganization(Organization organization, String userId);


    /**
     * Updates an organization based on the organization template.
     *
     * @param organization the organization template
     * @return the updated created organization
     */
    Organization updateOrganization(Organization organization);
}
