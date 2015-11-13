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

import net.e2.bw.servicereg.core.service.OrganizationService;
import net.e2.bw.servicereg.core.service.UserService;
import net.e2.bw.servicereg.model.User;
import net.e2.bw.servicereg.model.UserOrganization;
import org.jboss.resteasy.annotations.GZIP;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import java.util.Objects;

/**
 * Implements the user REST api
 */
@Path("/api/users")
public class UserRestService extends AbstractRestService {

    private static final Logger LOG = LoggerFactory.getLogger(UserRestService.class);

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    UserService userService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    OrganizationService organizationService;


    /** Hide private user data for non-site-admins and the current user */
    private void hideNonPublicUserInfo(User user) {
        if (user != null &&
                !hasSiteRole("admin") &&
                !Objects.equals(user.getUserId(), getSubject().getUserId())) {
            user.setEmailAddress(null);
        }
    }

    /**
     * Searches the user base and returns a paginated result
     * @param userPattern the user search pattern
     * @param page the search result page
     * @param size the search result page size
     * @return the paginated search result
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @GZIP
    @NoCache
    public PagedResult<User> getUsers(
            @QueryParam("userPattern") String userPattern,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {

        requireAuthenticated();

        List<User> users = userService.searchUsers(userPattern);

        // We should hide the email address for non-site admins
        users.stream().forEach(this::hideNonPublicUserInfo);

        return PagedResult.paginate(
                users,
                page,
                size,
                (u1, u2) -> u1.getUserId().compareTo(u2.getUserId())
        );
    }

    /**
     * Checks if the current user has any of the given comma-separated roles.
     * <p/>
     * Will return:
     * <ul>
     *     <li>'true': If the user has any of the given roles</li>
     *     <li>'false': If the user does not have any of the given roles</li>
     *     <li>Throws an exception if the user is not authenticated</li>
     * </ul>
     */
    @GET
    @Path("/check-site-roles/{roles}")
    @Produces(MediaType.APPLICATION_JSON)
    @NoCache
    public boolean checkSiteRoles(@PathParam("roles") String roles) {
        requireAuthenticated();
        return hasSiteRole(roles.split(","));
    }

    /**
     * Returns the number of users
     * @return the number of users
     */
    @GET
    @Path("count")
    @Produces(MediaType.APPLICATION_JSON)
    @NoCache
    public String getUsersCount() {
        return "{\"usersCount\":" + userService.getUserCount() + "}";
    }

    /**
     * Returns a specific user
     * @param userId the id of the user to return
     * @return the user
     */
    @GET
    @Path("{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    @NoCache
    public User getUser(@PathParam("userId") String userId) {
        requireAuthenticated();

        User user = userService.getUser(userId);
        hideNonPublicUserInfo(user);

        return user;
    }

    /**
     * Returns the JPEG image associated with the user
     * @param userId the id of the user
     * @return the image associated with the user
     */
    @GET
    @Path("{userId}/photo")
    @Produces("image/jpg")
    public Response getUserPhoto(@PathParam("userId") String userId) {

        CacheControl cc = new CacheControl();
        cc.setMaxAge(86400);

        byte[] image = userService.getUserPhoto(userId);
        if (image == null) {
            // Appallingly, Response.temporaryRedirect() is relative to the "/rest" root :-(
            URI profileImage = URI.create("../app/img/profile.jpg");
            return Response.temporaryRedirect(profileImage)
                    .cacheControl(cc)
                    .build();
        }

        return Response.ok(image)
                .cacheControl(cc)
                .build();
    }

    /**
     * Returns the list of organizations that the user is member of.
     * Updates the userRoles of each organization to be the roles of the user within the organization.
     * @param userId the user id
     * @return A list of organizations that the user is a member of
     */
    @GET
    @Path("{userId}/member-organizations")
    @Produces(MediaType.APPLICATION_JSON)
    @GZIP
    @NoCache
    public Iterable<UserOrganization> getUserMemberOrganizations(@PathParam("userId") String userId) {

        // Operation only allowed for site admins or the user herself
        if (!hasSiteRole("admin") && !Objects.equals(userId, getSubject().getUserId())) {
            throw new WebApplicationException("User is not authorized fetch user organizations ",
                    Response.Status.UNAUTHORIZED);
        }

        return organizationService.getUserMemberOrganizations(userId);
    }

    /**
     * Returns the list of organizations that the user can see.
     * Updates the userRoles of each organization to be the roles of the user within the organization.
     * @param userId the user id
     * @return A list of the organizations that the user can see
     */
    @GET
    @Path("{userId}/organizations")
    @Produces(MediaType.APPLICATION_JSON)
    @GZIP
    @NoCache
    public Iterable<UserOrganization> getUserOrganizations(@PathParam("userId") String userId) {

        // Operation only allowed for site admins or the user herself
        if (!hasSiteRole("admin") && !Objects.equals(userId, getSubject().getUserId())) {
            throw new WebApplicationException("User is not authorized fetch user organizations ",
                    Response.Status.UNAUTHORIZED);
        }

        // Look up organizations and update the role of the groups
        return organizationService.getUserOrganizations(userId);
    }
}
