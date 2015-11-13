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

import net.e2.bw.servicereg.core.service.ServiceSpecificationService;
import net.e2.bw.servicereg.ldap.model.CachedServiceSpecification;
import net.e2.bw.servicereg.model.ServiceSpecification;
import net.e2.bw.servicereg.model.ServiceType;
import org.slf4j.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.BasicAttributes;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static net.e2.bw.servicereg.ldap.LdapServerService.createAttribute;
import static net.e2.bw.servicereg.ldap.LdapServerService.getAttributeValue;
import static net.e2.bw.servicereg.ldap.OrganizationLdapService.extractGroupId;

/**
 * An LDAP specific implementation of the ServiceSpecificationService
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
@Stateless
public class ServiceSpecificationLdapService extends BaseLdapService implements ServiceSpecificationService {

    final static List<String> SPEC_ATTRS = Arrays.asList("uid", "cn", "description", "serviceOrganization", "serviceType");

    @Inject
    Logger log;


    /** {@inheritDoc} */
    @Override
    public ServiceSpecification getServiceSpecification(String serviceSpecificationId) {
        CachedServiceSpecification spec = getCachedServiceSpecification(serviceSpecificationId);
        return spec != null ? spec.copy() : null;
    }

    /** Returns a cached version of the service specification */
    public CachedServiceSpecification getCachedServiceSpecification(String serviceSpecificationId) {
        // Note to self: Really, we aught to synchronize on "id", along the lines of
        // http://illegalargumentexception.blogspot.dk/2008/04/java-synchronizing-on-transient-id.html

        CachedServiceSpecification spec = ldapCache.getServiceSpecificationCache().get(serviceSpecificationId);
        if (spec == null) {
            try {
                spec = toServiceSpecification(searchServiceSpecification(serviceSpecificationId, SPEC_ATTRS));
                if (spec != null) {
                    ldapCache.getServiceSpecificationCache().put(serviceSpecificationId, spec);
                }
            } catch (NamingException e) {
                throw new RuntimeException("Error accessing LDAP", e);
            }
        }
        return spec;
    }

    /** {@inheritDoc} */
    @Override
    public List<ServiceSpecification> getServiceSpecifications() {
        try {
            return searchServiceSpecifications(null, null).stream()
                    .map(sr -> extractServiceSpecificationId(sr.getNameInNamespace()))
                    .map(this::getServiceSpecification)
                    .collect(Collectors.toList());
        } catch (NamingException e) {
            throw new RuntimeException("Error accessing LDAP", e);
        }
    }

    /** {@inheritDoc} */
    @Override
    public ServiceSpecification createServiceSpecification(ServiceSpecification spec) {
        Objects.requireNonNull(spec, "Invalid service specification");
        Objects.requireNonNull(spec.getServiceSpecificationId(), "Service Specification ID must be specified");
        Objects.requireNonNull(spec.getOrganizationId(), "Organization ID must be specified");
        Objects.requireNonNull(spec.getName(), "Service Specification name must be specified");
        Objects.requireNonNull(spec.getServiceType(), "Service Specification type must be specified");

        CachedServiceSpecification existingSpec = getCachedServiceSpecification(spec.getServiceSpecificationId());
        if (existingSpec != null) {
            throw new RuntimeException("A service specification already exists with the ID " + spec.getServiceSpecificationId());
        }

        BasicAttributes attrs = new BasicAttributes();
        attrs.put(createAttribute("objectClass", getConfig().getServiceSpecObjectClasses().split(",")));
        attrs.put(createAttribute("cn", spec.getName()));
        attrs.put(createAttribute("uid", spec.getServiceSpecificationId()));
        attrs.put(createAttribute("serviceOrganization", getGroupDN(spec.getOrganizationId())));
        attrs.put(createAttribute("serviceType", spec.getServiceType().name()));
        if (spec.getSummary() != null) {
            attrs.put(createAttribute("description", spec.getSummary()));
        }

        // Create the service specification in LDAP
        String specDN = getServiceSpecificationDN(spec.getServiceSpecificationId());
        try {
            ldapServerService.addEntry(specDN, attrs);
        } catch (NamingException e) {
            log.error("Failed creating service specification " + spec.getServiceSpecificationId(), e);
            throw new RuntimeException("Failed creating service specification " + spec.getServiceSpecificationId(), e);
        }

        // Return (and cache) the newly created service specification.
        return getServiceSpecification(spec.getServiceSpecificationId());
    }

    /** {@inheritDoc} */
    @Override
    public ServiceSpecification updateServiceSpecification(ServiceSpecification spec) {
        Objects.requireNonNull(spec, "Invalid service specification");
        Objects.requireNonNull(spec.getName(), "Service Specification name must be specified");

        CachedServiceSpecification existingSpec = getCachedServiceSpecification(spec.getServiceSpecificationId());
        if (existingSpec == null) {
            throw new RuntimeException("No service specification exists with the ID " + spec.getServiceSpecificationId());
        }

        // Only some of the attributes can be updated  after creation
        String specDN = getServiceSpecificationDN(spec.getServiceSpecificationId());
        boolean updated = false;
        try {
            // Update name
            if (!Objects.equals(spec.getName(), existingSpec.getName())) {
                ldapServerService.modifyAttribute(specDN, createAttribute("cn", spec.getName()));
                updated = true;
            }

            // Summary
            if (!Objects.equals(spec.getSummary(), existingSpec.getSummary())) {
                ldapServerService.modifyAttribute(specDN, createAttribute("description", spec.getSummary()));
                updated = true;
            }

            // Service types
            if (!Objects.equals(spec.getServiceType(), existingSpec.getServiceType())) {
                ldapServerService.modifyAttribute(specDN, createAttribute("serviceType", spec.getServiceType().name()));
                updated = true;
            }

        } catch (NamingException e) {
            log.error("Failed updating service specification " + spec.getServiceSpecificationId(), e);
            throw new RuntimeException("Failed updating service specification " + spec.getServiceSpecificationId(), e);
        }

        // Un-cache the service specification
        if (updated) {
            ldapCache.getServiceSpecificationCache().evict(spec.getServiceSpecificationId());
        }

        // Return the (potentially) updated service specification.
        return getServiceSpecification(spec.getServiceSpecificationId());
    }


    /** Converts a search result to a service specification entry */
    private CachedServiceSpecification toServiceSpecification(SearchResult sr) {

        if (sr == null) {
            return null;
        }

        Attributes attrs = sr.getAttributes();
        String serviceSpecificationId = getAttributeValue(attrs, "uid");
        String name = getAttributeValue(attrs, "cn");
        String summary = getAttributeValue(attrs, "description");
        String organizationId = extractGroupId(getAttributeValue(attrs, "serviceOrganization"));
        ServiceType serviceType = ServiceType.valueOf(getAttributeValue(attrs, "serviceType"));

        return new CachedServiceSpecification(serviceSpecificationId, organizationId,
                name, summary, serviceType);
    }


    /*******************************************/
    /** Service Specification LDAP Operations **/
    /*******************************************/

    /** Extracts the service specification ID from the DN */
    public static String extractServiceSpecificationId(String serviceSpecificationDN) {
        return extractLastRdnValue(serviceSpecificationDN);
    }

    /** Searches for the service specification with the given ID and returns the given attributes */
    public SearchResult searchServiceSpecification(String serviceSpecificationId, Collection<String> attrs) throws NamingException {

        String filter = String.format("(|(%s=%s)(%s=%s))",
                getConfig().getServiceSpecUidAttribute(),
                serviceSpecificationId,
                ldapServerService.getUuidAttrName(),
                serviceSpecificationId);

        List<SearchResult> specs = searchServiceSpecifications(filter, attrs);
        return specs.size() > 0 ? specs.get(0) : null;
    }

    /** Searches for service specifications with the given filter and returns the given attributes */
    public List<SearchResult> searchServiceSpecifications(String filter, Collection<String> attrs) throws NamingException {

        return ldapServerService.search(
                getConfig().getServiceSpecSearchDN(),
                filter,
                attrs,
                SearchControls.ONELEVEL_SCOPE
        );
    }
}
