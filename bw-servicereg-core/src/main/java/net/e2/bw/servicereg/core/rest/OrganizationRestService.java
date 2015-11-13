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

import net.e2.bw.servicereg.core.Roles.OrganizationRole;
import net.e2.bw.servicereg.core.service.OrganizationService;
import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.JsonSerializable;
import net.e2.bw.servicereg.model.Organization;
import net.e2.bw.servicereg.model.UserOrganization;
import org.apache.commons.io.IOUtils;
import org.jboss.resteasy.annotations.GZIP;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import org.slf4j.Logger;

import javax.imageio.ImageIO;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static net.e2.bw.servicereg.core.rest.OrganizationRestService.OrganizationRoleUpdateParam.Update.*;

/**
 * Implements the organization REST api
 */
@Path("/api")
public class OrganizationRestService extends AbstractRestService {

    @Inject
    Logger log;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    OrganizationService organizationService;


    /**
     * Searches the organizations based on an organization name pattern
     * @param organizationNamePattern the name pattern to match
     * @return the search result
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("org")
    @GZIP
    @NoCache
    public Iterable<Organization> getOrganizations(
            @QueryParam("namePattern") @DefaultValue("") String organizationNamePattern) {
        requireAuthenticated();
        return organizationService.searchOrganizations(organizationNamePattern);
    }


    /**
     * Returns a specific organization
     * @param organizationId the organization id
     * @return the organization
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("org/{organizationId}")
    @GZIP
    @NoCache
    public UserOrganization getOrganization(@PathParam("organizationId") String organizationId) {
        requireAuthenticated();
        return organizationService.getUserOrganization(organizationId, getSubject().getUserId());
    }


    /**
     * Returns if a specific organization exists
     * @param organizationId the organization id
     * @return if the organization exists
     */
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("org/{organizationId}/exists")
    @NoCache
    public boolean organizationExists(@PathParam("organizationId") String organizationId) {
        requireAuthenticated();
        return organizationService.getOrganization(organizationId) != null;
    }


    /**
     * Returns the logo of an organization
     * @param organizationId the organization id
     * @return the logo of an organization
     */
    @GET
    @Path("org/{organizationId}/logo")
    @Produces("image/png")
    public Response getOrgPhoto(@PathParam("organizationId") String organizationId) {

        CacheControl cc = new CacheControl();
        cc.setMaxAge(86400);

        byte[] image = organizationService.getOrganizationLogo(organizationId);
        if (image == null) {
            // Appallingly, Response.temporaryRedirect() is relative to the "/rest" root :-(
            URI profileImage = URI.create("../app/img/organization.png");
            return Response.temporaryRedirect(profileImage)
                    .cacheControl(cc)
                    .build();
        }

        return Response.ok(image)
                .cacheControl(cc)
                .build();
    }


    /**
     * Updates the logo of an organization
     * @param organizationId the organization id
     * @param input the image
     * @return the updated organization
     */
    @POST
    @Path("org/{organizationId}/logo")
    @Consumes("multipart/form-data")
    @NoCache
    public Response setOrgPhoto(@PathParam("organizationId") String organizationId, MultipartFormDataInput input) {

        // Look up organization with incl. the roles of the current subject in relation to the organization
        UserOrganization organization = organizationService.getUserOrganization(organizationId, getSubject().getUserId());

        // Operation only allowed for site or organization admins
        if (!hasSiteRole("admin") && !hasOrganizationRole(organization, "admin")) {
            throw new WebApplicationException("User is not authorized to updated organization photo ",
                    Response.Status.UNAUTHORIZED);
        }

        //Get API input data
        Map<String, List<InputPart>> uploadForm = input.getFormDataMap();

        //Get file data to save
        List<InputPart> inputParts = uploadForm.get("attachment");

        try {
            if (inputParts != null && inputParts.size() > 0) {
                InputPart inputPart = inputParts.get(0);

                // convert the uploaded file to input stream
                InputStream inputStream = inputPart.getBody(InputStream.class, null);

                // If not PNG, convert it
                byte[] bytes;
                String fileName = getFileName(inputPart.getHeaders());
                if (fileName == null || !fileName.toLowerCase().endsWith(".png")) {
                    BufferedImage image = ImageIO.read(inputStream);
                    ByteArrayOutputStream pngImage = new ByteArrayOutputStream();
                    ImageIO.write(image, "png", pngImage);
                    bytes = pngImage.toByteArray();

                } else {
                    // Already a PNG image
                    bytes = IOUtils.toByteArray(inputStream);
                }


                organization.setLogo(bytes);
                organizationService.updateOrganization(organization);
            }
        } catch (Exception e) {
            log.error("Error uploading logo", e);
            return Response
                    .serverError()
                    .build();
        }
        return Response
                .status(201)
                .entity(getOrganization(organizationId))
                .build();
    }


    /** Extracts the file name from the header */
    private String getFileName(MultivaluedMap<String, String> header) {

        return Arrays.asList(header.getFirst("Content-Disposition").split(";")).stream()
                .filter(fn -> fn.trim().startsWith("filename"))
                .map(fn -> fn.split("=")[1].trim().replaceAll("\"", ""))
                .findAny()
                .orElse(null);
    }


    /**
     * Creates a new organization
     * @param organization the organization to create
     * @return the newly created organization
     */
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("org")
    @NoCache
    public Organization createOrganization(Organization organization) {

        // All registered users can create a new organization
        requiresSiteRole("user");

        return organizationService.createOrganization(organization, getSubject().getUserId());
    }


    /**
     * Updates an organization
     * @param organization the organization to update
     * @return the updated organization
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("org")
    @NoCache
    public Organization updateOrganization(Organization organization) {

        // Look up organization with incl. the roles of the current subject in relation to the organization
        UserOrganization existingOrg = organizationService.getUserOrganization(
                organization.getOrganizationId(), getSubject().getUserId());

        // Operation only allowed for site or organization admins
        if (!hasSiteRole("admin") && !hasOrganizationRole(existingOrg, "admin")) {
            throw new WebApplicationException("User is not authorized to updated organization",
                    Response.Status.UNAUTHORIZED);
        }

        // The logo is not sent along
        if (organization.getLogo() == null) {
            organization.setLogo(existingOrg.getLogo());
        }

        return organizationService.updateOrganization(organization);
    }


    // ------------------------------------------------------------------------
    // MEMBERSHIP
    // ------------------------------------------------------------------------

    /**
     * Returns the members of an organization
     * @param organizationId the organization id
     * @return the members of the organization
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("org/{organizationId}/member")
    @GZIP
    @NoCache
    public Iterable<AuthorizedUser> getOrganizationMembers(@PathParam("organizationId") String organizationId) {

        // Look up organization with incl. the roles of the current subject in relation to the organization
        UserOrganization organization = organizationService.getUserOrganization(organizationId, getSubject().getUserId());

        // Operation only allowed for site admins or organization members
        if (!hasSiteRole("admin") && !hasOrganizationRole(organization, "user")) {
            return Collections.emptyList();
        }

        return organizationService.getOrganizationUsers(organizationId);
    }

    /**
     * Returns the number of organization members
     * @param organizationId the organization id
     * @return the number of organization members
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("org/{organizationId}/member/count")
    @NoCache
    public String getOrganizationMemberCount(@PathParam("organizationId") String organizationId) {
        requireAuthenticated();

        int cnt = organizationService.getOrganizationUsers(organizationId).size();
        return "{\"membersCount\":" + cnt + "}";
    }


    // ------------------------------------------------------------------------
    // ORGANIZATION ROLES
    // ------------------------------------------------------------------------

    /**
     * Updates the organization role of user
     * @param organizationId the organization
     * @param roleUpdate the role update
     */
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("org/{organizationId}/role")
    @NoCache
    public void assignOrganizationRole(
            @PathParam("organizationId") String organizationId,
            OrganizationRoleUpdateParam roleUpdate) {

        // TODO: Check roles. There are many combinations depending on
        // the site roles of the user, organization roles of the user
        // and whether the user is the current subject.

        String userId = roleUpdate.getUserId();
        OrganizationRole role = OrganizationRole.valueOf(roleUpdate.getRole());

        if (roleUpdate.getUpdate() == reject) {
            if (role != OrganizationRole.applicant && role != OrganizationRole.invited) {
                throw new WebApplicationException("Rejected role must be 'applicant' or 'invited'", Response.Status.BAD_REQUEST);
            }
            // Delete role and membership
            organizationService.removeOrganizationRole(organizationId, userId, role.toString(), true);

        } else if (roleUpdate.getUpdate() == accept) {
            if (role != OrganizationRole.applicant && role != OrganizationRole.invited) {
                throw new WebApplicationException("Accepted role must be 'applicant' or 'invited'", Response.Status.BAD_REQUEST);
            }
            // Delete role, but not membership
            organizationService.removeOrganizationRole(organizationId, userId, role.toString(), false);

        } else if (roleUpdate.getUpdate() == remove && role == OrganizationRole.user) {
            // Leave the organization
            organizationService.leaveOrganization(organizationId, userId);

        } else if (roleUpdate.getUpdate() == remove) {
            // Delete role, but not membership
            organizationService.removeOrganizationRole(organizationId, userId, role.toString(), false);

        } else if (roleUpdate.getUpdate() == assign) {
            organizationService.assignOrganizationRole(organizationId, userId, role.toString());
        }
    }


    /** Used for managing organization roles */
    public static class OrganizationRoleUpdateParam implements JsonSerializable {
        enum Update { assign, remove, accept, reject }

        String userId;
        String role;
        Update update;
        String message;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Update getUpdate() {
            return update;
        }

        public void setUpdate(Update update) {
            this.update = update;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }


}
