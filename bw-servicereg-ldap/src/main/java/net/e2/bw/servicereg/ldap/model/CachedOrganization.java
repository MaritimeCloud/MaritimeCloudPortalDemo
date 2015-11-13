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
package net.e2.bw.servicereg.ldap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import net.e2.bw.servicereg.core.Roles;
import net.e2.bw.servicereg.model.UserOrganization;
import net.e2.bw.servicereg.model.Organization;
import net.e2.bw.servicereg.core.Roles.OrganizationRole;

import java.util.*;
import java.util.stream.Collectors;

/**
 * An immutable Organization implementation suitable for caching.
 * Keeps track of organization members and user roles.
 */
public class CachedOrganization extends Organization {

    /** Cache ID of all users that are member of the group */
    @JsonIgnore
    private List<String> memberIds;

    /** Map role names to lists of user ids */
    @JsonIgnore
    private Map<String, List<String>> roleUserMap;

    /** Constructor */
    public CachedOrganization(String organizationId, String name, String summary, String url, String country,
                              byte[] logo, List<String> memberIds, Map<String, List<String>> roleUserMap) {
        super.setOrganizationId(organizationId);
        super.setName(name);
        super.setSummary(summary);
        super.setUrl(url);
        super.setCountry(country);
        super.setLogo(logo);
        this.memberIds = Collections.unmodifiableList(memberIds != null ? memberIds : new ArrayList<>());
        this.roleUserMap = Collections.unmodifiableMap(roleUserMap != null ? roleUserMap : new HashMap<>());
        // NB: Actually, each element of the roleUserMap should be made unmodifiable...
    }

    /**
     * Will make a copy of this organization and initialize the roles of a
     * specific user and save it to the userRoles list.
     * @param userId the user
     * @return the updated copy of this organization entry
     */
    public UserOrganization toUserOrganization(String userId) {
        UserOrganization org = new UserOrganization();

        // Copy the organization fields
        copyTo(org);

        org.setUserId(userId);

        // Since roles are hierarchical, e.g. "admin" implies "user", compute
        // the effective set of roles
        Set<String> roles = roleUserMap.keySet().stream()
                .filter(r -> roleUserMap.get(r).contains(userId))
                .flatMap(r -> Roles.effectiveOrganizationRoles(r).stream())
                .collect(Collectors.toSet());

        // The "user" role is implied by membership, unless you have the "invited" or "applicant" roles
        if (getMemberIds().contains(userId) &&
                !roles.contains(OrganizationRole.applicant.name()) &&
                !roles.contains(OrganizationRole.invited.name())) {
            roles.add(OrganizationRole.user.name());
        }

        org.setUserRoles(roles.toArray(new String[roles.size()]));

        List<String> applicants = roleUserMap.get(OrganizationRole.applicant.name());
        org.setApplicantNo(applicants == null ? 0 : applicants.size());
        return org;
    }

    /**
     * Checks if the user has the given role
     * @param userId the user
     * @param role the role
     * @return if the user has the given role
     */
    public boolean userHasRole(String userId, String role) {
        return userId != null && role != null &&
                roleUserMap.containsKey(role) &&
                roleUserMap.get(role).contains(userId);
    }

    /** Called by setter methods to flag that the class is immutable */
    private void flagImmutable() {
        throw new UnsupportedOperationException("CachedOrganization is immutable");
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    @Override
    public void setOrganizationId(String organizationId) {
        flagImmutable();
    }

    @Override
    public void setName(String name) {
        flagImmutable();
    }

    @Override
    public void setSummary(String summary) {
        flagImmutable();
    }

    @Override
    public void setUrl(String url) {
        flagImmutable();
    }

    @Override
    public void setCountry(String country) {
        flagImmutable();
    }

    @Override
    public void setLogo(byte[] logo) {
        flagImmutable();
    }

    public List<String> getMemberIds() {
        return memberIds;
    }

    public Map<String, List<String>> getRoleUserMap() {
        return roleUserMap;
    }
}
