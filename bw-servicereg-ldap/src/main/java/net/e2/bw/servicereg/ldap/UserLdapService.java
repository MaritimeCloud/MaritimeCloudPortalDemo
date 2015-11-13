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

import net.e2.bw.servicereg.core.service.UserService;
import net.e2.bw.servicereg.ldap.model.CachedUser;
import net.e2.bw.servicereg.model.User;

import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import static net.e2.bw.servicereg.ldap.LdapServerService.getAttributeValue;

/**
 * An LDAP specific implementation of the UserService
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public class UserLdapService extends BaseLdapService implements UserService {

    final static List<String> USER_ATTRS = Arrays.asList("uid", "mail", "givenName", "sn", "jpegPhoto");


    /** {@inheritDoc} */
    @Override
    public User getUser(String userId) {

        CachedUser user = getCachedUser(userId);
        return user != null ? user.copy() : null;
    }

    /** Returns a cached version of the user */
    public CachedUser getCachedUser(String userId) {
        // Note to self: Really, we aught to synchronize on "id", along the lines of
        // http://illegalargumentexception.blogspot.dk/2008/04/java-synchronizing-on-transient-id.html

        CachedUser user = ldapCache.getUserCache().get(userId);
        if (user == null) {
            try {
                user = toUser(searchUser(userId, USER_ATTRS));
                if (user != null) {
                    ldapCache.getUserCache().put(userId, user);
                }
            } catch (NamingException e) {
                throw new RuntimeException("Error accessing LDAP", e);
            }
        }
        return user;
    }


    /** {@inheritDoc} */
    @Override
    public byte[] getUserPhoto(String userId) {

        CachedUser user = getCachedUser(userId);
        return user == null ? null : user.getPhoto();
    }


    /** {@inheritDoc} */
    @Override
    public List<User> searchUsers(String searchTerm) {
        String filter = searchTerm == null || searchTerm.length() == 0
            ? null
            : String.format("(|(uid=*%s*)(mail=*%s*)(givenName=*%s*))", searchTerm, searchTerm, searchTerm);

        try {
            return searchUsers(filter, null).stream()
                    .map(sr -> extractUserId(sr.getNameInNamespace()))
                    .map(this::getUser)
                    .collect(Collectors.toList());
        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public int getUserCount() {
        try {
            return (int)searchUsers(null, null).stream().count();
        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }


    /** Converts a search result to a user entry */
    private CachedUser toUser(SearchResult sr) {
        if (sr == null) {
            return null;
        }

        Attributes attrs = sr.getAttributes();
        String userId = getAttributeValue(attrs, "uid");
        String emailAddress = getAttributeValue(attrs, "mail");
        String firstName = getAttributeValue(attrs, "givenName");
        String lastName = getAttributeValue(attrs, "sn");
        byte[] photo = getAttributeValue(attrs, "jpegPhoto");

        return new CachedUser(userId, emailAddress, firstName, lastName, photo);
    }


    /*******************************/
    /** User LDAP Operations      **/
    /*******************************/

    /** Extracts the user ID from the DN */
    public static String extractUserId(String userDN) {
        return extractLastRdnValue(userDN);
    }

    /** Searches for the user with the given ID and returns the given attributes */
    public SearchResult searchUser(String userId, Collection<String> attrs) throws NamingException {

        String filter = String.format("(|(%s=%s)(%s=%s))",
                getConfig().getUserUidAttribute(),
                userId,
                ldapServerService.getUuidAttrName(),
                userId);

        List<SearchResult> users = searchUsers(filter, attrs);
        return users.size() > 0 ? users.get(0) : null;
    }

    /** Searches for users with the given filter and returns the given attributes */
    public List<SearchResult> searchUsers(String filter, Collection<String> attrs) throws NamingException {

        return ldapServerService.search(
                getConfig().getUserSearchDN(),
                filter,
                attrs,
                SearchControls.ONELEVEL_SCOPE
        );
    }

}
