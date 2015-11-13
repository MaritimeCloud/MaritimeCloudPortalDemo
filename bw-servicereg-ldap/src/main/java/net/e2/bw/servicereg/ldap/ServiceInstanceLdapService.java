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

import com.fasterxml.jackson.databind.ObjectMapper;
import net.e2.bw.servicereg.core.service.ServiceInstanceService;
import net.e2.bw.servicereg.core.service.ServiceSpecificationService;
import net.e2.bw.servicereg.core.service.UserService;
import net.e2.bw.servicereg.ldap.model.CachedOrganization;
import net.e2.bw.servicereg.ldap.model.CachedServiceInstance;
import net.e2.bw.servicereg.model.*;
import net.e2.bw.servicereg.model.coverage.Area;
import org.slf4j.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.NamingException;
import javax.naming.directory.*;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterInputStream;

import static net.e2.bw.servicereg.ldap.LdapServerService.*;
import static net.e2.bw.servicereg.ldap.OrganizationLdapService.extractGroupId;
import static net.e2.bw.servicereg.ldap.ServiceSpecificationLdapService.extractServiceSpecificationId;

/**
 * An LDAP specific implementation of the ServiceInstanceService
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
@Stateless
public class ServiceInstanceLdapService extends BaseLdapService implements ServiceInstanceService {

    final static List<String> SERVICE_ATTRS = Arrays.asList("uid", "cn", "description", "serviceOrganization",
            "serviceSpecification", "serviceCoverage", "serviceEndpoint");

    @Inject
    Logger log;

    @Inject
    ServiceSpecificationService serviceSpecificationService;

    @Inject
    UserService userService;

    /** {@inheritDoc} */
    @Override
    public ServiceInstance getServiceInstance(String serviceInstanceId) {
        CachedServiceInstance spec = getCachedServiceInstance(serviceInstanceId);
        return spec != null ? spec.copy() : null;
    }

    /** Returns a cached version of the service instance */
    public CachedServiceInstance getCachedServiceInstance(String serviceInstanceId) {
        // Note to self: Really, we aught to synchronize on "id", along the lines of
        // http://illegalargumentexception.blogspot.dk/2008/04/java-synchronizing-on-transient-id.html

        CachedServiceInstance service = ldapCache.getServiceInstanceCache().get(serviceInstanceId);
        if (service == null) {
            try {
                service = toServiceInstance(searchServiceInstance(serviceInstanceId, SERVICE_ATTRS));
                if (service != null) {
                    ldapCache.getServiceInstanceCache().put(serviceInstanceId, service);
                }
            } catch (NamingException e) {
                throw new RuntimeException("Error accessing LDAP", e);
            }
        }
        return service;
    }

    /** {@inheritDoc} */
    @Override
    public List<ServiceInstance> searchServiceInstances(String organizationId, ServiceType serviceType, String searchTerm) {

        // NB: Since we cannot join over with service-specs, database-style, filtering on serviceType is handled post-search.
        String filter = null;
        if (searchTerm != null && searchTerm.length() > 0) {
            filter = String.format("(|(cn=*%s*)(uid=*%s*)(description=*%s*))", searchTerm, searchTerm, searchTerm);
        }
        if (organizationId != null && organizationId.length() > 0) {
            String orgFilter = String.format("(serviceOrganization=%s)", getGroupDN(organizationId));
            filter = (filter == null)
                    ? orgFilter
                    : String.format("(&%s%s", filter, orgFilter);
        }

        try {
            return searchServiceInstances(filter, null).stream()
                    .map(sr -> extractServiceInstanceId(sr.getNameInNamespace()))
                    .map(this::getServiceInstance)
                    .filter(s -> {
                        if (serviceType != null) {
                            try {
                                ServiceSpecification spec =
                                        serviceSpecificationService.getServiceSpecification(s.getSpecificationId());
                                return spec.getServiceType() == serviceType;
                            } catch (Exception ignored) {
                                return false;
                            }
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public List<AuthorizedUser> getServiceInstanceUsers(String serviceInstanceId) {
        Map<String, AuthorizedUser> authorizedUsers = new HashMap<>();
        CachedServiceInstance service = getCachedServiceInstance(serviceInstanceId);
        service.getRoleUserMap().forEach((role, users) -> {
            users.forEach(u -> {
                try {
                    AuthorizedUser user = authorizedUsers.get(u);
                    if (user == null) {
                        user =  new AuthorizedUser();
                        userService.getUser(u).copyTo(user);
                        authorizedUsers.put(u, user);
                    }
                    user.setServiceRoles(appendRole(user.getServiceRoles(), role));
                } catch (Exception ignored) {
                }
            });
        });
        return new ArrayList<>(authorizedUsers.values());
    }

    /** Helper method that appends a role to an array of roles */
    static String[] appendRole(String[] roles, String role) {
        roles = (roles == null) ? new String[1] : Arrays.copyOf(roles, roles.length + 1);
        roles[roles.length - 1] = role;
        return roles;
    }

    /** {@inheritDoc} */
    @Override
    public void assignServiceInstanceRole(String serviceInstanceId, String userId, String role) {
        Objects.requireNonNull(role);
        Objects.requireNonNull(userService.getUser(userId));
        CachedServiceInstance service = Objects.requireNonNull(getCachedServiceInstance(serviceInstanceId));
        String userDN = getUserDN(userId);
        String serviceDN = getServiceInstanceDN(service.getServiceInstanceId());

        // Check if the user already holds the role
        if (service.userHasRole(userId, role)) {
            return;
        }

        try {
            List<String> attrs = Collections.singletonList(getConfig().getRoleMemberAttribute());
            // NB: Create the role entry if it does not exist
            SearchResult roleEntry = searchRoleEntry(serviceDN, role, attrs, true);

            if (roleEntry == null) {
                // Failed looking up or creating the role entry
                throw new NamingException("Error getting role entry " + role + " for service " + serviceDN);
            }

            // Add the user as a role member
            ldapServerService.addUniqueAttributeValue(
                    roleEntry.getNameInNamespace(),
                    getConfig().getRoleMemberAttribute(),
                    userDN);
            log.info("Added " + userId + " as " + role + " for service " + serviceDN);

            // Un-cache the organization
            ldapCache.getServiceInstanceCache().evict(serviceInstanceId);

        } catch (NamingException e) {
            throw new RuntimeException("Error assigning service role ", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public void removeServiceInstanceRole(String serviceInstanceId, String userId, String role) {
        Objects.requireNonNull(role);
        Objects.requireNonNull(userService.getUser(userId));
        CachedServiceInstance service = Objects.requireNonNull(getCachedServiceInstance(serviceInstanceId));
        String userDN = getUserDN(userId);
        String serviceDN = getServiceInstanceDN(service.getServiceInstanceId());

        // Check if the user does not hold the role
        if (!service.userHasRole(userId, role)) {
            return;
        }

        try {
            List<String> attrs = Collections.singletonList(getConfig().getRoleMemberAttribute());
            // NB: Do NOT create the role entry if it does not exist
            SearchResult roleEntry = searchRoleEntry(serviceDN, role, attrs, true);

            if (roleEntry == null) {
                // Should actually never happen, since the cached service had the corresponding role for the user
                return;
            }

            // Remove the user as a role member
            ldapServerService.removeAttributeValue(
                    roleEntry.getNameInNamespace(),
                    getConfig().getRoleMemberAttribute(),
                    userDN,
                    true);
            log.info("Removed " + userId + " as " + role + " for service " + serviceInstanceId);

            // Un-cache the organization
            ldapCache.getServiceInstanceCache().evict(serviceInstanceId);

        } catch (NamingException e) {
            throw new RuntimeException("Error removing service role ", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public ServiceInstance createServiceInstance(ServiceInstance service) {
        Objects.requireNonNull(service, "Invalid service instance");
        Objects.requireNonNull(service.getServiceInstanceId(), "Service instance ID must be specified");
        Objects.requireNonNull(service.getOrganizationId(), "Organization ID must be specified");
        Objects.requireNonNull(service.getSpecificationId(), "Service specification ID must be specified");
        Objects.requireNonNull(service.getName(), "Service instance name must be specified");

        CachedServiceInstance existingSpec = getCachedServiceInstance(service.getServiceInstanceId());
        if (existingSpec != null) {
            throw new RuntimeException("A service instance already exists with the ID " + service.getServiceInstanceId());
        }

        BasicAttributes attrs = new BasicAttributes();
        attrs.put(createAttribute("objectClass", getConfig().getServiceInstanceObjectClasses().split(",")));
        attrs.put(createAttribute("cn", service.getName()));
        attrs.put(createAttribute("uid", service.getServiceInstanceId()));
        attrs.put(createAttribute("serviceOrganization", getGroupDN(service.getOrganizationId())));
        attrs.put(createAttribute("serviceSpecification", getServiceSpecificationDN(service.getSpecificationId())));
        if (service.getSummary() != null) {
            attrs.put(createAttribute("description", service.getSummary()));
        }
        byte[] coverage = compressCoverage(service.getCoverage());
        if (coverage != null) {
            attrs.put(createBinaryAttribute("serviceCoverage", coverage));
        }
        if (service.getEndpoints() != null && service.getEndpoints().size() > 0) {
            String[] endpoints = toEndpointArray(service.getEndpoints());
            attrs.put(createAttribute("serviceEndpoint", endpoints));
        }

        // Create the service instance in LDAP
        String serviceDN = getServiceInstanceDN(service.getServiceInstanceId());
        try {
            ldapServerService.addEntry(serviceDN, attrs);
        } catch (NamingException e) {
            log.error("Failed creating service instance " + service.getServiceInstanceId(), e);
            throw new RuntimeException("Failed creating service instance " + service.getServiceInstanceId(), e);
        }

        // Return (and cache) the newly created service instance.
        return getServiceInstance(service.getServiceInstanceId());
    }

    /** {@inheritDoc} */
    @Override
    public ServiceInstance updateServiceInstance(ServiceInstance service) {
        Objects.requireNonNull(service, "Invalid service instance");
        Objects.requireNonNull(service.getName(), "Service Instance name must be specified");

        CachedServiceInstance existingService = getCachedServiceInstance(service.getServiceInstanceId());
        if (existingService == null) {
            throw new RuntimeException("No service instance exists with the ID " + service.getServiceInstanceId());
        }

        // Only some of the attributes can be updated after creation
        String serviceDN = getServiceInstanceDN(service.getServiceInstanceId());
        boolean updated = false;
        try {
            // Update name
            if (!Objects.equals(service.getName(), existingService.getName())) {
                ldapServerService.modifyAttribute(serviceDN, createAttribute("cn", service.getName()));
                updated = true;
            }

            // Summary
            if (!Objects.equals(service.getSummary(), existingService.getSummary())) {
                ldapServerService.modifyAttribute(serviceDN, createAttribute("description", service.getSummary()));
                updated = true;
            }

            // Coverage
            if (!Objects.equals(service.getCoverage(), existingService.getCoverage())) {
                byte[] coverage = compressCoverage(service.getCoverage());
                Attribute attr = createBinaryAttribute("serviceCoverage", coverage);
                ldapServerService.modifyAttribute(serviceDN, attr);
                updated = true;
            }

            // Endpoints
            if (!Objects.equals(service.getEndpoints(), existingService.getEndpoints())) {
                String[] endpoints = toEndpointArray(service.getEndpoints());
                ldapServerService.modifyAttribute(serviceDN, createAttribute("serviceEndpoint", endpoints));
                updated = true;
            }

        } catch (NamingException e) {
            log.error("Failed updating service instance " + service.getServiceInstanceId(), e);
            throw new RuntimeException("Failed updating service instance " + service.getServiceInstanceId(), e);
        }

        // Un-cache the service instance
        if (updated) {
            ldapCache.getServiceInstanceCache().evict(service.getServiceInstanceId());
        }

        // Return the (potentially) updated service instance.
        return getServiceInstance(service.getServiceInstanceId());
    }

    /** Converts a list of endpoints to an array of endpoint URIs */
    private String[] toEndpointArray(List<ServiceEndpoint> endpoints) {
        return endpoints == null
            ? null
            : endpoints.stream()
                .map(e -> {
                    try {
                        return e.getUri().toString();
                    } catch (Exception ignored) {
                    }
                    return null;
                })
                .filter(e -> e != null)
                .toArray(String[]::new);
    }

    /** Converts a search result to a service instance entry */
    private CachedServiceInstance toServiceInstance(SearchResult sr) {

        if (sr == null) {
            return null;
        }

        Attributes attrs = sr.getAttributes();
        String serviceInstanceId = getAttributeValue(attrs, "uid");
        String name = getAttributeValue(attrs, "cn");
        String summary = getAttributeValue(attrs, "description");
        String organizationId = extractGroupId(getAttributeValue(attrs, "serviceOrganization"));
        String serviceSpecificationId = extractServiceSpecificationId(getAttributeValue(attrs, "serviceSpecification"));
        List<Area> coverage = decompressCoverage(getAttributeValue(attrs, "serviceCoverage"));

        List<ServiceEndpoint> endpoints = new ArrayList<>();
        Attribute endpointAttr = attrs.get("serviceEndpoint");
        for (int i = 0; endpointAttr != null && i < endpointAttr.size(); ++i) {
            try {
                endpoints.add(new ServiceEndpoint((String)endpointAttr.get(i)));
            } catch (Exception ignored) {
            }
        }

        Map<String, List<String>> roleUserMap = getRoleUsers(getServiceInstanceDN(serviceInstanceId));

        return new CachedServiceInstance(serviceInstanceId, organizationId, serviceSpecificationId,
                name, summary, coverage, endpoints, roleUserMap);
    }

    /** Converts coverage to compressed json */
    public static byte[] compressCoverage(List<Area> coverage) {
        if (coverage != null && coverage.size() > 0) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                String json = mapper.writeValueAsString(new CoverageWrapper(coverage));

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                OutputStream out = new DeflaterOutputStream(baos);
                out.write(json.getBytes("UTF-8"));
                out.close();
                return baos.toByteArray();
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    /** Extracts coverage from compressed json */
    public static List<Area> decompressCoverage(byte[] bytes) {
        if (bytes != null &&  bytes.length > 0) {
            try {
                InputStream in = new InflaterInputStream(new ByteArrayInputStream(bytes));
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192];
                int len;
                while((len = in.read(buffer))>0) {
                    baos.write(buffer, 0, len);
                }
                String json = new String(baos.toByteArray(), "UTF-8");

                ObjectMapper mapper = new ObjectMapper();
                CoverageWrapper coverage = mapper.readValue(new StringReader(json), CoverageWrapper.class);
                return coverage.getCoverage();
            } catch (Exception ignored) {
                ignored.printStackTrace();
            }
        }
        return new ArrayList<>();
    }

    /**
     * The methods to compress and decompress coverage will not emit the Area type because
     * they are serialized to and fro json as root entities. See:
     * https://github.com/FasterXML/jackson-databind/issues/336
     * Solution: we wrap the area list in this entity
     */
    public static class CoverageWrapper {
        List<Area> coverage;

        @SuppressWarnings("unused")
        public CoverageWrapper() {
        }

        public CoverageWrapper(List<Area> coverage) {
            this.coverage = coverage;
        }

        public List<Area> getCoverage() {
            return coverage;
        }

        public void setCoverage(List<Area> coverage) {
            this.coverage = coverage;
        }
    }

    /*******************************************/
    /** Service Instance LDAP Operations      **/
    /*******************************************/

    /** Extracts the service instance ID from the DN */
    public static String extractServiceInstanceId(String serviceInstanceDN) {
        return extractLastRdnValue(serviceInstanceDN);
    }

    /** Searches for the service instance with the given ID and returns the given attributes */
    public SearchResult searchServiceInstance(String serviceInstanceId, Collection<String> attrs) throws NamingException {

        String filter = String.format("(|(%s=%s)(%s=%s))",
                getConfig().getServiceInstanceUidAttribute(),
                serviceInstanceId,
                ldapServerService.getUuidAttrName(),
                serviceInstanceId);

        List<SearchResult> services = searchServiceInstances(filter, attrs);
        return services.size() > 0 ? services.get(0) : null;
    }

    /** Searches for service instance with the given filter and returns the given attributes */
    public List<SearchResult> searchServiceInstances(String filter, Collection<String> attrs) throws NamingException {

        return ldapServerService.search(
                getConfig().getServiceInstanceSearchDN(),
                filter,
                attrs,
                SearchControls.ONELEVEL_SCOPE
        );
    }

}
