package net.e2.bw.servicereg.core.rest;

import net.e2.bw.servicereg.core.Roles;
import net.e2.bw.servicereg.core.service.*;
import net.e2.bw.servicereg.model.*;
import org.jboss.resteasy.annotations.GZIP;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.slf4j.Logger;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;
import java.util.stream.Collectors;

import static net.e2.bw.servicereg.core.rest.MaritimeServiceRestService.ServiceRoleUpdateParam.Update.assign;
import static net.e2.bw.servicereg.core.rest.MaritimeServiceRestService.ServiceRoleUpdateParam.Update.remove;

/**
 * Implements the maritime services REST api
 */
@Path("/api")
public class MaritimeServiceRestService extends AbstractRestService {

    @Inject
    Logger log;

    @Inject
    OperationalServiceService operationalServiceService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    ServiceSpecificationService serviceSpecificationService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    ServiceInstanceService serviceInstanceService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    OrganizationService organizationService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    UserService userService;


    @GET
    @Path("stats")
    @Produces(MediaType.APPLICATION_JSON)
    @GZIP
    @NoCache
    public String getServiceStats() {
        return "{\"users\":" + userService.getUserCount() + ", "
                + "\"organizations\":" + organizationService.getOrganizations().size() + ", "
                + "\"operationalServices\":" + operationalServiceService.getOperationalServices().size() + ", "
                + "\"servicesSpecifications\":" + serviceSpecificationService.getServiceSpecifications().size() + ", "
                + "\"services\":" + serviceInstanceService.getServiceInstances().size() + "}";
    }

    // ------------------------------------------------------------------------
    // SERVICE TYPES
    // ------------------------------------------------------------------------

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-types")
    @GZIP
    @NoCache
    public ServiceType[] queryServiceTypes() {
        return ServiceType.values();
    }

    // ------------------------------------------------------------------------
    // OPERATIONAL SERVICES
    // ------------------------------------------------------------------------

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("operational-service")
    @GZIP
    @NoCache
    public Iterable<OperationalService> queryOperationalServices() {
        return operationalServiceService.getOperationalServices();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("operational-service/{operationalServiceId}")
    @GZIP
    @NoCache
    public OperationalService getOperationalService(@PathParam("operationalServiceId") String operationalServiceId) {
        return operationalServiceService.getOperationalService(operationalServiceId);
    }

    // ------------------------------------------------------------------------
    // SERVICE SPECIFICATIONS
    // ------------------------------------------------------------------------

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-specification")
    @GZIP
    @NoCache
    public Iterable<ServiceSpecification> queryServiceSpecifications(
            @QueryParam("operationalServiceId") @DefaultValue("") String operationalServiceId,
            @QueryParam("organizationId") @DefaultValue("") String organizationId,
            @QueryParam("serviceType") @DefaultValue("") String serviceType,
            @QueryParam("anyTextPattern") @DefaultValue("") String anyTextPattern
    ) {

        // TODO: Verify...
        return serviceSpecificationService.getServiceSpecifications().stream()
                .filter(s -> match(s.getServiceSpecificationId(), operationalServiceId, true)
                        && match(s.getOrganizationId(), organizationId, false)
                        && match(s.getServiceType(), serviceType, false)
                        && (match(s.getName(), anyTextPattern, true) || match(s.getSummary(), anyTextPattern, true))
                )
                .collect(Collectors.toList());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-specification/{serviceSpecificationId}")
    @GZIP
    @NoCache
    public ServiceSpecification getServiceSpecification(
            @PathParam("serviceSpecificationId") String serviceSpecificationId
    ) {
        return serviceSpecificationService.getServiceSpecification(serviceSpecificationId);
    }

    /**
     * Returns if a specific organization exists
     * @param serviceSpecificationId the service specification id
     * @return if the organization exists
     */
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("service-specification/{serviceSpecificationId}/exists")
    @NoCache
    public boolean serviceSpecificationExists(
          @PathParam("serviceSpecificationId") String serviceSpecificationId) {
        return getServiceSpecification(serviceSpecificationId) != null;
    }

    /**
     * Creates a new service specification
     * @param serviceSpecification the service specification to create
     * @return the newly created service specification
     */
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("service-specification")
    @NoCache
    public ServiceSpecification createServiceSpecification(
            ServiceSpecification serviceSpecification) {

        // Operation only allowed for site or organization admins
        UserOrganization org = organizationService.getUserOrganization(
                serviceSpecification.getOrganizationId(),
                getSubject().getUserId());
        if (!hasSiteRole("admin") && !hasOrganizationRole(org, "admin")) {
            throw new WebApplicationException("User is not authorized to create service specification",
                    Response.Status.UNAUTHORIZED);
        }

        return serviceSpecificationService.createServiceSpecification(serviceSpecification);
    }


    /**
     * Updates a service specification
     * @param serviceSpecification the service specification to update
     * @return the updated service specification
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("service-specification")
    @NoCache
    public ServiceSpecification updateServiceSpecification(
            ServiceSpecification serviceSpecification) {

        // Operation only allowed for site or organization admins
        UserOrganization org = organizationService.getUserOrganization(
                serviceSpecification.getOrganizationId(),
                getSubject().getUserId());
        if (!hasSiteRole("admin") && !hasOrganizationRole(org, "admin")) {
            throw new WebApplicationException("User is not authorized to update service specification",
                    Response.Status.UNAUTHORIZED);
        }

        return serviceSpecificationService.updateServiceSpecification(serviceSpecification);
    }

    // ------------------------------------------------------------------------
    // SERVICE INSTANCES
    // ------------------------------------------------------------------------

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-instance")
    @GZIP
    @NoCache
    public Iterable<ServiceInstance> queryServiceInstances(
            @QueryParam("organizationId") @DefaultValue("") String organizationId,
            @QueryParam("serviceType") @DefaultValue("") String serviceType,
            @QueryParam("anyTextPattern") @DefaultValue("") String anyTextPattern
    ) {
        ServiceType type = serviceType.length() == 0 ? null : ServiceType.valueOf(serviceType);
        return serviceInstanceService.searchServiceInstances(organizationId, type, anyTextPattern);
    }


    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-instance/{serviceInstanceId}")
    @GZIP
    @NoCache
    public ServiceInstance getServiceInstance(
            @PathParam("serviceInstanceId") String serviceInstanceId
    ) {
        return serviceInstanceService.getServiceInstance(serviceInstanceId);
    }

    /**
     * Returns if a specific instance exists
     * @return if the service instance exists
     */
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("service-instance/{serviceInstanceId}/exists")
    @NoCache
    public boolean serviceInstanceExists(
            @PathParam("serviceInstanceId") String serviceInstanceId) {
        return getServiceInstance(serviceInstanceId) != null;
    }

    /**
     * Creates a new service instance
     * @param serviceInstance the service instance to create
     * @return the newly created service instance
     */
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("service-instance")
    @NoCache
    public ServiceInstance createServiceInstance(ServiceInstance serviceInstance) {

        // Operation only allowed for site or organization admins
        UserOrganization org = organizationService.getUserOrganization(
                serviceInstance.getOrganizationId(),
                getSubject().getUserId());
        if (!hasSiteRole("admin") && !hasOrganizationRole(org, "admin")) {
            throw new WebApplicationException("User is not authorized to create service instance",
                    Response.Status.UNAUTHORIZED);
        }

        return serviceInstanceService.createServiceInstance(serviceInstance);
    }


    /**
     * Updates a service instance
     * @param serviceInstance the service instance to update
     * @return the updated service instance
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("service-instance")
    @NoCache
    public ServiceInstance updateServiceInstance(ServiceInstance serviceInstance) {

        // Operation only allowed for site or organization admins
        UserOrganization org = organizationService.getUserOrganization(
                serviceInstance.getOrganizationId(),
                getSubject().getUserId());
        if (!hasSiteRole("admin") && !hasOrganizationRole(org, "admin")) {
            throw new WebApplicationException("User is not authorized to update service instance",
                    Response.Status.UNAUTHORIZED);
        }

        return serviceInstanceService.updateServiceInstance(serviceInstance);
    }

    // ------------------------------------------------------------------------
    // SERVICE INSTANCE ROLES
    // ------------------------------------------------------------------------

    /**
     * Returns the members of a service instance
     * @param serviceInstanceId the service instance id
     * @return the members of the service instancev
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-instance/{serviceInstanceId}/member")
    @GZIP
    @NoCache
    public Iterable<AuthorizedUser> getServiceInstanceMembers(@PathParam("serviceInstanceId") String serviceInstanceId) {

        // Look up the service instance
        ServiceInstance service = Objects.requireNonNull(serviceInstanceService.getServiceInstance(serviceInstanceId));

        // Look up service organization incl. the roles of the current subject in relation to the organization
        UserOrganization organization = organizationService.getUserOrganization(service.getOrganizationId(), getSubject().getUserId());

        // Operation only allowed for site admins or organization members
        if (!hasSiteRole("admin") && !hasOrganizationRole(organization, "user")) {
            return Collections.emptyList();
        }

        return serviceInstanceService.getServiceInstanceUsers(serviceInstanceId);
    }

    /**
     * Returns the number of service instance members
     * @param serviceInstanceId the service instance id
     * @return the number of service instance members
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-instance/{serviceInstanceId}/member/count")
    @NoCache
    public String getOrganizationMemberCount(@PathParam("serviceInstanceId") String serviceInstanceId) {
        requireAuthenticated();

        int cnt = serviceInstanceService.getServiceInstanceUsers(serviceInstanceId).size();
        return "{\"membersCount\":" + cnt + "}";
    }

    /**
     * Updates the service instance role of users and organizations
     * @param serviceInstanceId the service instance
     * @param roleUpdate the role update
     */
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("service-instance/{serviceInstanceId}/role")
    @NoCache
    public void assignOrganizationRole(
            @PathParam("serviceInstanceId") String serviceInstanceId,
            ServiceRoleUpdateParam roleUpdate) {

        // Look up the service instance
        ServiceInstance service = Objects.requireNonNull(serviceInstanceService.getServiceInstance(serviceInstanceId));

        // Look up service organization incl. the roles of the current subject in relation to the organization
        UserOrganization organization = organizationService.getUserOrganization(service.getOrganizationId(), getSubject().getUserId());

        // Operation only allowed for site admins or organization admins
        if (!hasSiteRole("admin") && !hasOrganizationRole(organization, "admin")) {
            throw new WebApplicationException("User is not authorized to change service roles",
                    Response.Status.UNAUTHORIZED);
        }

        Set<String> users = new HashSet<>();
        if (roleUpdate.getOrganizationId() != null) {
            organizationService.getOrganizationUsers(roleUpdate.getOrganizationId())
                .forEach(u -> users.add(u.getUserId()));
        }
        if (roleUpdate.getUserId() != null) {
            users.add(roleUpdate.getUserId());
        }
        String role = roleUpdate.getRole();

        if (roleUpdate.getUpdate() == remove) {
            users.forEach(userId -> serviceInstanceService.removeServiceInstanceRole(serviceInstanceId, userId, role));

        } else if (roleUpdate.getUpdate() == assign) {
            users.forEach(userId -> serviceInstanceService.assignServiceInstanceRole(serviceInstanceId, userId, role));
        }
    }


    /** Used for managing service roles */
    public static class ServiceRoleUpdateParam implements JsonSerializable {
        enum Update { assign, remove }

        String userId;
        String organizationId;
        String role;
        Update update;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getOrganizationId() {
            return organizationId;
        }

        public void setOrganizationId(String organizationId) {
            this.organizationId = organizationId;
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
    }

    // ------------------------------------------------------------------------
    // UTILITY METHODS
    // ------------------------------------------------------------------------

    /** Utility method for checking string matches */
    boolean match (Object val, Object text, boolean substr) {
        if (text == null || text.toString().length() == 0) {
            return true;
        } else if (val == null) {
            return false;
        }
        return substr
                ? val.toString().contains(text.toString())
                : val.toString().equals(text.toString());
    }

}
