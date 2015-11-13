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

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.InvalidNameException;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
import javax.naming.directory.*;
import javax.naming.ldap.LdapName;
import java.util.*;

import static net.e2.bw.servicereg.ldap.UserLdapService.extractUserId;

/**
 * Base class for LDAP service implementations
 */
@Stateless
public class BaseLdapService {

    @Inject
    LdapServerService ldapServerService;

    @Inject
    LdapCache ldapCache;

    /** Shortcut to get the ldap configuration */
    protected LdapConfig getConfig() {
        return ldapServerService.getConfig();
    }

    /*******************************/
    /** Shared LDAP Methods       **/
    /*******************************/

    /** Extracts the last RDN value from the DN */
    protected static String extractLastRdnValue(String dn) {
        try {
            LdapName name = new LdapName(dn);
            return (String) name.getRdn(name.size() - 1).getValue();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /** Creates a DN for the given group */
    protected String getGroupDN(String id) {
        try {
            return (new LdapName(getConfig().getGroupSearchDN()).add(getConfig().getGroupRDNAttribute() + "=" + id)).toString();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /** Creates a DN for the given user */
    protected String getUserDN(String userId) {
        try {
            return (new LdapName(getConfig().getUserSearchDN()).add(getConfig().getUserRDNAttribute() + "=" + userId)).toString();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /** Creates a DN for the given service specification */
    protected String getServiceSpecificationDN(String serviceSpecificationId) {
        try {
            return (new LdapName(getConfig().getServiceSpecSearchDN()).add(getConfig().getServiceSpecRDNAttribute()
                    + "=" + serviceSpecificationId)).toString();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /** Creates a DN for the given service instance */
    protected String getServiceInstanceDN(String serviceInstanceId) {
        try {
            return (new LdapName(getConfig().getServiceInstanceSearchDN()).add(getConfig().getServiceInstanceRDNAttribute()
                    + "=" + serviceInstanceId)).toString();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /*******************************/
    /** Common Roles Methods      **/
    /*******************************/

    /** Extracts the role name from the DN */
    public static String extractRoleName(String roleDN) {
        return extractLastRdnValue(roleDN);
    }

    /** Creates a DN for the given role associated with the given entry DN */
    protected String getRoleDN(String dn, String role) {
        try {
            return (new LdapName(dn).add(getConfig().getRoleRDNAttribute() + "=" + role)).toString();
        } catch (InvalidNameException e) {
            return null;
        }
    }

    /** Searches for roles associated with the given DN, i.e. subtree role entries */
    protected List<SearchResult> searchRoles(String dn) throws NamingException {

        String objectClassFilter = "(objectClass=" + getConfig().getRoleSearchObjectClass() + ")";
        List<String> attrs = Arrays.asList(getConfig().getRoleRDNAttribute(), getConfig().getRoleMemberAttribute());

        return ldapServerService.search(
                dn,
                objectClassFilter,
                attrs,
                SearchControls.SUBTREE_SCOPE
        );
    }

    /** Checks if the role entry associated with the given DN entry should be created */
    protected SearchResult searchRoleEntry(String dn, String role, Collection<String> attrs, boolean create) throws NamingException {
        String roleDN = Objects.requireNonNull(getRoleDN(dn, role));

        List<SearchResult> result = null;
        try {
            result = ldapServerService.search(roleDN, null, attrs, SearchControls.OBJECT_SCOPE);
        } catch (NameNotFoundException e) {
            if (create) {
                Attributes newEntryAttrs = new BasicAttributes();
                Attribute objectClassAttr = new BasicAttribute("objectClass");
                objectClassAttr.add("top");
                objectClassAttr.add(getConfig().getRoleSearchObjectClass());
                newEntryAttrs.put(objectClassAttr);
                Attribute nameAttr = new BasicAttribute(getConfig().getRoleRDNAttribute());
                nameAttr.add(role);
                newEntryAttrs.put(nameAttr);
                ldapServerService.addEntry(roleDN, newEntryAttrs);

                // Look up the newly created entry
                result = ldapServerService.search(roleDN, null, attrs, SearchControls.OBJECT_SCOPE);
            }
        }

        return result != null && result.size() >= 0 ? result.get(0) : null;
    }

    /**
     * Returns a map that maps roles to user ids
     * @param dn the entry to load roles for
     * @return the role map
     */
    protected Map<String, List<String>> getRoleUsers(String dn) {

        // Load role entries below under the organization DN
        Map<String, List<String>> roles = new HashMap<>();

        try {
            for (SearchResult sr : searchRoles(dn)) {
                String roleName = extractRoleName(sr.getNameInNamespace());
                List<String> userIds = new ArrayList<>();
                Attribute memberAttr = sr.getAttributes().get(getConfig().getRoleMemberAttribute());
                for (int i = 0; memberAttr != null && i < memberAttr.size(); ++i) {
                    try {
                        userIds.add(extractUserId((String)memberAttr.get(i)));
                    } catch (NamingException ignored) {
                    }
                }
                roles.put(roleName, userIds);
            }

        } catch (NamingException ignored) {
        }
        return roles;
    }


}
