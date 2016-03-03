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
package net.e2.bw.servicereg.core.rest;

import net.e2.bw.servicereg.core.Roles;
import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.UserOrganization;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.Set;

/**
 * Base REST functionality and helper methods
 */
public class AbstractRestService {

    public static final String SUBJECT_ATTR = "subject";

    @Context
    protected HttpServletRequest request;

    /**
     * Returns the current subject or null if undefined
     * @return the current subject
     */
    protected AuthorizedUser getSubject() {
        return request.getSession() == null
                ? null
                : (AuthorizedUser) request.getSession().getAttribute(SUBJECT_ATTR);
    }

    /**
     * Returns if the user is authenticated
     * @return if the user is authenticated
     */
    protected boolean isAuthenticated() {
//        return getSubject() != null;
    	// Always return true. This should be removed when all rest-service calls are to the backend
    	return true;
    }

    /**
     * Throws an exception if the user is not authenticated
     */
    protected void requireAuthenticated() {
        if (!isAuthenticated()) {
            throw new WebApplicationException("User not authenticated", Response.Status.UNAUTHORIZED);
        }
    }

    /**
     * Checks if the user has any of the given site roles
     * @param roles the roles to check for
     * @return if the user has any of the given roles
     */
    protected boolean hasSiteRole(String... roles) {
        if (roles == null || roles.length == 0) {
            return true;
        }

        AuthorizedUser subject = getSubject();
        if (subject == null || subject.getSiteRoles() == null) {
            return false;
        }

        // Compute the subject's effective roles
        Set<String> effectiveRoles = Roles.effectiveServiceRoles(subject.getSiteRoles());

        return Arrays.stream(roles)
                .filter(effectiveRoles::contains)
                .count() > 0;
    }


    /** Asserts the the user must be logged in and have at least one of the given site roles. */
    protected void requiresSiteRole(String... roles) {
        if (!hasSiteRole(roles)) {
            throw new WebApplicationException("User does not have the required site roles ",
                    Response.Status.UNAUTHORIZED);
        }
    }

    /**
     * Checks if the user has any of the given organization roles
     * @param roles the roles to check for
     * @return if the user has any of the given roles
     */
    protected boolean hasOrganizationRole(UserOrganization org, String... roles) {
        if (roles == null || roles.length == 0) {
            return true;
        }

        if (org == null || org.getUserRoles() == null) {
            return false;
        }

        // Compute the subject's effective roles
        Set<String> effectiveRoles = Roles.effectiveOrganizationRoles(org.getUserRoles());

        return Arrays.stream(roles)
                .filter(effectiveRoles::contains)
                .count() > 0;
    }


    /** Asserts the the user must be logged in and have at least one of the given organization roles. */
    protected void requiresOrganizationRole(UserOrganization org, String... roles) {
        if (!hasOrganizationRole(org, roles)) {
            throw new WebApplicationException("User does not have the required user roles ",
                    Response.Status.UNAUTHORIZED);
        }
    }


    protected static void assertNotNull(Object objectToTestForNull, String message) throws WebApplicationException {
        if (objectToTestForNull == null) {
            throw new WebApplicationException(message, Response.Status.NOT_FOUND);
        }
    }

}
