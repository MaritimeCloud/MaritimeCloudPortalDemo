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
package net.e2.bw.servicereg.ldap;

import net.e2.bw.servicereg.core.Roles.OrganizationRole;
import net.e2.bw.servicereg.core.service.OrganizationService;
import net.e2.bw.servicereg.core.service.UserService;
import net.e2.bw.servicereg.ldap.model.CachedOrganization;
import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.Organization;
import net.e2.bw.servicereg.model.User;
import net.e2.bw.servicereg.model.UserOrganization;
import org.slf4j.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.NamingException;
import javax.naming.directory.*;
import java.util.*;
import java.util.stream.Collectors;

import static net.e2.bw.servicereg.ldap.LdapServerService.createAttribute;
import static net.e2.bw.servicereg.ldap.LdapServerService.getAttributeValue;
import static net.e2.bw.servicereg.ldap.UserLdapService.extractUserId;

/**
 * An LDAP specific implementation of the OrganizationService.
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
@Stateless
public class OrganizationLdapService extends BaseLdapService implements OrganizationService {

    final static List<String> ORG_ATTRS = Arrays.asList("cn", "uid", "description", "labeledURI", "c", "photo", "uniqueMember");

    @Inject
    Logger log;

    @Inject
    UserService userService;


    /** {@inheritDoc} */
    @Override
    public Organization getOrganization(String organizationId) {
        CachedOrganization org = getCachedOrganization(organizationId);
        return org != null ? org.copy() : null;
    }

    /** Looks up a cached instance of the organization */
    public CachedOrganization getCachedOrganization(String organizationId) {
        // Note to self: Really, we aught to synchronize on "id", along the lines of
        // http://illegalargumentexception.blogspot.dk/2008/04/java-synchronizing-on-transient-id.html

        CachedOrganization org = ldapCache.getOrganizationCache().get(organizationId);
        if (org == null) {
            try {
                SearchResult result = searchGroup(organizationId, ORG_ATTRS);
                org = toOrg(result);
                if  (org != null) {
                    ldapCache.getOrganizationCache().put(organizationId, org);
                }
            } catch (NamingException e) {
                throw new RuntimeException("Error accessing LDAP", e);
            }
        }
        return org;
    }


    /** {@inheritDoc} */
    @Override
    public byte[] getOrganizationLogo(String organizationId) {
        Organization organization = getCachedOrganization(organizationId);
        return (organization == null) ? null : organization.getLogo();
    }


    /** {@inheritDoc} */
    @Override
    public List<Organization> searchOrganizations(String searchTerm) {
        String filter = searchTerm == null || searchTerm.length() == 0
                ? null
                : String.format("(|(cn=*%s*)(uid=*%s*)(description=*%s*))", searchTerm, searchTerm, searchTerm);

        try {
            String groupIdAttr = getConfig().getGroupUidAttribute();

            return searchGroups(filter, Collections.singletonList(groupIdAttr)).stream()
                    .map(sr -> (String) getAttributeValue(sr.getAttributes(), groupIdAttr))
                    .map(this::getOrganization)
                    .collect(Collectors.toList());
        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }


    /** {@inheritDoc} */
    @Override
    public UserOrganization getUserOrganization(String organizationId, String userId) {
        return getCachedOrganization(organizationId).toUserOrganization(userId);
    }


    /** {@inheritDoc} */
    @Override
    public List<UserOrganization> getUserMemberOrganizations(String userId) {
        try {
            String groupIdAttr = getConfig().getGroupUidAttribute();

            return searchUserGroups(userId, Collections.singletonList(groupIdAttr)).stream()
                    .map(sr -> (String) getAttributeValue(sr.getAttributes(), groupIdAttr))
                    .map(id -> getCachedOrganization(id).toUserOrganization(userId))
                    .collect(Collectors.toList());

        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public List<UserOrganization> getUserOrganizations(String userId) {
        return getOrganizations().stream()
                .map(o -> getCachedOrganization(o.getOrganizationId()).toUserOrganization(userId))
                .collect(Collectors.toList());
    }

    /** {@inheritDoc} */
    @Override
    public List<AuthorizedUser> getOrganizationUsers(String organizationId) {
        List<AuthorizedUser> authorizedUsers = new ArrayList<>();
        CachedOrganization org = getCachedOrganization(organizationId);
        org.getMemberIds().forEach(userId -> {
            try {
                User user = userService.getUser(userId);
                AuthorizedUser authorizedUser = toMember(user, org);
                authorizedUsers.add(authorizedUser);
            } catch (Exception ignored) {
            }
        });
        return authorizedUsers;
    }

    /** Creates a member for this user with proper organization roles */
    public AuthorizedUser toMember(User user, CachedOrganization org) {
        AuthorizedUser authorizedUser = new AuthorizedUser();
        user.copyTo(authorizedUser);
        UserOrganization memberOrg = org.toUserOrganization(user.getUserId());
        authorizedUser.setOrganizationRoles(memberOrg.getUserRoles());
        return authorizedUser;
    }



    /** {@inheritDoc} */
    @Override
    public void assignOrganizationRole(String organizationId, String userId, String role) {
        Objects.requireNonNull(role);
        Objects.requireNonNull(userService.getUser(userId));
        CachedOrganization org = Objects.requireNonNull(getCachedOrganization(organizationId));
        String userDN = getUserDN(userId);
        String orgDN = getGroupDN(org.getName());

        // Check if the user already holds the role
        if (org.userHasRole(userId, role)) {
            return;
        }

        try {
            List<String> attrs = Collections.singletonList(getConfig().getRoleMemberAttribute());
            // NB: Create the role entry if it does not exist
            SearchResult roleEntry = searchRoleEntry(orgDN, role, attrs, true);

            if (roleEntry == null) {
                // Failed looking up or creating the role entry
                throw new NamingException("Error getting role entry " + role + " for organization " + orgDN);
            }

            // Add the user as a role member
            ldapServerService.addUniqueAttributeValue(
                    roleEntry.getNameInNamespace(),
                    getConfig().getRoleMemberAttribute(),
                    userDN);
            log.info("Added " + userId + " as " + role + " in organization " + organizationId);

            // If the user is not already a group member, add her
            if (!org.getMemberIds().contains(userId)) {
                ldapServerService.addUniqueAttributeValue(
                        orgDN,
                        getConfig().getGroupMemberAttribute(),
                        userDN);
                log.info("Added " + userId + " as member of organization " + organizationId);
            }

            // Un-cache the organization
            ldapCache.getOrganizationCache().evict(organizationId);

        } catch (NamingException e) {
            throw new RuntimeException("Error assigning organization role ", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public void removeOrganizationRole(String organizationId, String userId, String role, boolean removeAsMember) {
        Objects.requireNonNull(role);
        Objects.requireNonNull(userService.getUser(userId));
        CachedOrganization org = Objects.requireNonNull(getCachedOrganization(organizationId));
        String userDN = getUserDN(userId);
        String orgDN = getGroupDN(org.getName());

        // Check if the user does not hold the role
        if (!org.userHasRole(userId, role)) {
            return;
        }

        try {
            List<String> attrs = Collections.singletonList(getConfig().getRoleMemberAttribute());
            // NB: Do NOT create the role entry if it does not exist
            SearchResult roleEntry = searchRoleEntry(orgDN, role, attrs, false);

            if (roleEntry == null) {
                // Should actually never happen, since the cached org had the corresponding role for the user
                return;
            }

            // Remove the user as a role member
            ldapServerService.removeAttributeValue(
                    roleEntry.getNameInNamespace(),
                    getConfig().getRoleMemberAttribute(),
                    userDN,
                    true);
            log.info("Removed " + userId + " as " + role + " in organization " + organizationId);

            // If the user is a group member and removeAsMember has been set, remove her as a member
            if (org.getMemberIds().contains(userId) && removeAsMember) {
                ldapServerService.removeAttributeValue(
                        orgDN,
                        getConfig().getGroupMemberAttribute(),
                        userDN,
                        false);
                log.info("Removed " + userId + " as member of organization " + organizationId);
            }

            // Un-cache the organization
            ldapCache.getOrganizationCache().evict(organizationId);

        } catch (NamingException e) {
            throw new RuntimeException("Error removing organization role ", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public void leaveOrganization(String organizationId, String userId) {
        Objects.requireNonNull(userService.getUser(userId));
        CachedOrganization org = Objects.requireNonNull(getCachedOrganization(organizationId));
        String userDN = getUserDN(userId);
        String orgDN = getGroupDN(org.getName());

        org.getRoleUserMap().keySet().stream()
            .filter(r -> org.userHasRole(userId, r))
            .forEach(r -> {
                try {
                    removeOrganizationRole(organizationId, userId, r, false);
                } catch (Exception e) {
                    log.error("Failed removing role " + r + " from user " + userId + " in organization " + organizationId);
                }
            });

        if (org.getMemberIds().contains(userId)) {
            try {
                ldapServerService.removeAttributeValue(
                        orgDN,
                        getConfig().getGroupMemberAttribute(),
                        userDN,
                        false);
                log.info("Removed " + userId + " as member of organization " + organizationId);
            } catch (NamingException e) {
                throw new RuntimeException("Error removing member " + userId + " from organization " + organizationId, e);
            }
        }

        // Un-cache the organization
        ldapCache.getOrganizationCache().evict(organizationId);
    }



    /** {@inheritDoc} */
    @Override
    public Organization createOrganization(Organization organization, String userId) {
        Objects.requireNonNull(organization, "Invalid organization");
        Objects.requireNonNull(organization.getOrganizationId(), "Organization ID must be specified");
        Objects.requireNonNull(organization.getName(), "Organization name must be specified");

        CachedOrganization existingOrg = getCachedOrganization(organization.getOrganizationId());
        if (existingOrg != null) {
            throw new RuntimeException("An organization already exists with the ID " + organization.getOrganizationId());
        }

        BasicAttributes attrs = new BasicAttributes();
        attrs.put(createAttribute("objectClass", getConfig().getGroupObjectClasses().split(",")));
        attrs.put(createAttribute("cn", organization.getName()));
        attrs.put(createAttribute("uid", organization.getOrganizationId()));
        if (organization.getSummary() != null) {
            attrs.put(createAttribute("description", organization.getSummary()));
        }
        if (organization.getCountry() != null && organization.getCountry().length() == 2) {
            attrs.put(createAttribute("c", organization.getCountry()));
        }
        if (organization.getUrl() != null && organization.getUrl().length() > 0) {
            attrs.put(createAttribute("labeledURI", organization.getUrl()));
        }
        attrs.put(createAttribute(getConfig().getGroupMemberAttribute(), getUserDN(userId)));

        // Create the organization in LDAP
        String orgDN = getGroupDN(organization.getName());
        try {
            ldapServerService.addEntry(orgDN, attrs);
        } catch (NamingException e) {
            log.error("Failed creating organization " + organization.getOrganizationId(), e);
            throw new RuntimeException("Failed creating organization " + organization.getOrganizationId(), e);
        }

        // Assign the "admin" role to the user that created the organization
        assignOrganizationRole(organization.getOrganizationId(), userId, OrganizationRole.admin.name());

        // Return (and cache) the newly created organization.
        return getOrganization(organization.getOrganizationId());
    }

    /** {@inheritDoc} */
    @Override
    public Organization updateOrganization(Organization organization) {
        Objects.requireNonNull(organization, "Invalid organization");
        Objects.requireNonNull(organization.getOrganizationId(), "Organization ID must be specified");
        Objects.requireNonNull(organization.getName(), "Organization name must be specified");

        CachedOrganization existingOrg = getCachedOrganization(organization.getOrganizationId());
        if (existingOrg == null) {
            throw new RuntimeException("No organization exists with the ID " + organization.getOrganizationId());
        }

        String orgDN = getGroupDN(existingOrg.getName());
        boolean updated = false;
        try {
            // Update name change
            if (!Objects.equals(organization.getName(), existingOrg.getName())) {
                // Rename the entry
                String newOrgDN = getGroupDN(organization.getName());
                ldapServerService.renameEntry(orgDN, newOrgDN);
                orgDN = newOrgDN;
                updated = true;
            }

            // Summary
            if (!Objects.equals(organization.getSummary(), existingOrg.getSummary())) {
                ldapServerService.modifyAttribute(orgDN, createAttribute("description", organization.getSummary()));
                updated = true;
            }

            // Country
            if (!Objects.equals(organization.getCountry(), existingOrg.getCountry())) {
                ldapServerService.modifyAttribute(orgDN, createAttribute("c", organization.getCountry()));
                updated = true;
            }

            // URL
            if (!Objects.equals(organization.getUrl(), existingOrg.getUrl())) {
                String url = organization.getUrl() != null && organization.getUrl().length() > 0
                        ? organization.getUrl()
                        : null;
                ldapServerService.modifyAttribute(orgDN, createAttribute("labeledURI", url));
                updated = true;
            }

            // Logo
            if (!Arrays.equals(organization.getLogo(), existingOrg.getLogo())) {
                Attribute attr = new BasicAttribute("photo");
                attr.add(organization.getLogo());
                ldapServerService.modifyAttribute(orgDN, attr);
                updated = true;
            }

        } catch (NamingException e) {
            log.error("Failed updating organization " + organization.getOrganizationId(), e);
            throw new RuntimeException("Failed updating organization " + organization.getOrganizationId(), e);
        }

        // Un-cache the organization
        if (updated) {
            ldapCache.getOrganizationCache().evict(organization.getOrganizationId());
        }

        // Return the (potentially) updated organization.
        return getOrganization(organization.getOrganizationId());

    }


    /** Converts a search result to an organization entry */
    private CachedOrganization toOrg(SearchResult sr) {
        if (sr == null) {
            return null;
        }

        Attributes attrs = sr.getAttributes();
        String organizationId = getAttributeValue(attrs, "uid");
        String name = getAttributeValue(attrs, "cn");
        String summary = getAttributeValue(attrs, "description");
        String url = getAttributeValue(attrs, "labeledURI");
        String country = getAttributeValue(attrs, "c");
        if (country == null) {
            // If the country is undefined, assume organization
            country = "";
        }
        byte[] logo = getAttributeValue(attrs, "photo");

        List<String> memberIds = new ArrayList<>();
        Attribute memberAttr = attrs.get(getConfig().getGroupMemberAttribute());
        for (int i = 0; i < memberAttr.size(); ++i) {
            try {
                memberIds.add(extractUserId((String) memberAttr.get(i)));
            } catch (NamingException ignored) {
            }
        }

        Map<String, List<String>> roleUserMap = getRoleUsers(getGroupDN(name));
        return new CachedOrganization(organizationId, name, summary, url, country, logo,
                memberIds, roleUserMap);
    }

    /*******************************/
    /** Group LDAP Operations     **/
    /*******************************/

    /** Extracts the group ID from the DN */
    public static String extractGroupId(String groupDN) {
        return extractLastRdnValue(groupDN);
    }

    /** Searches for the group with the given ID and returns the given attributes */
    public SearchResult searchGroup(String id, Collection<String> attrs) throws NamingException {

        String filter = String.format("(|(%s=%s)(%s=%s))",
                getConfig().getGroupUidAttribute(),
                id,
                ldapServerService.getUuidAttrName(),
                id);

        List<SearchResult> groups = searchGroups(filter, attrs);
        return groups.size() > 0 ? groups.get(0) : null;
    }

    /** Searches for groups with the given filter and returns the given attributes */
    public List<SearchResult> searchGroups(String filter, Collection<String> attrs) throws NamingException {

        String objectClassFilter = "(objectClass=" + getConfig().getGroupSearchObjectClass() + ")";
        filter = (filter == null)
                ? objectClassFilter
                : "(&(" + filter + ")" + objectClassFilter + ")";

        return ldapServerService.search(
                getConfig().getGroupSearchDN(),
                filter,
                attrs,
                SearchControls.SUBTREE_SCOPE
        );
    }

    /** Searches for groups that the user is member of */
    public List<SearchResult> searchUserGroups(String userId, Collection<String> attrs) throws NamingException {

        String filter = "(" + getConfig().getGroupMemberAttribute() + "=" + getUserDN(userId) + ")";
        return searchGroups(filter, attrs);
    }
}
