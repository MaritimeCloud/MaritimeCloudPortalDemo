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
import net.e2.bw.servicereg.model.ServiceEndpoint;
import net.e2.bw.servicereg.model.ServiceInstance;
import net.e2.bw.servicereg.model.ServiceSpecification;
import net.e2.bw.servicereg.model.ServiceType;
import net.e2.bw.servicereg.model.coverage.Area;

import java.util.*;

/**
 * An immutable ServiceInstance implementation suitable for caching.
 */
public class CachedServiceInstance extends ServiceInstance {

    /** Map role names to lists of user ids */
    @JsonIgnore
    private Map<String, List<String>> roleUserMap;

    /** Constructor */
    public CachedServiceInstance(String serviceInstanceId, String organizationId, String specificationId, String name, String summary,
                                 List<Area> coverage, List<ServiceEndpoint> endpoints, Map<String, List<String>> roleUserMap) {
        super.setServiceInstanceId(serviceInstanceId);
        super.setOrganizationId(organizationId);
        super.setSpecificationId(specificationId);
        super.setName(name);
        super.setSummary(summary);
        super.setCoverage(Collections.unmodifiableList(coverage != null ? coverage : new ArrayList<>()));
        super.setEndpoints(Collections.unmodifiableList(endpoints != null ? endpoints : new ArrayList<>()));
        this.roleUserMap = Collections.unmodifiableMap(roleUserMap != null ? roleUserMap : new HashMap<>());
        // NB: Actually, each element of the roleUserMap should be made unmodifiable...
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
        throw new UnsupportedOperationException("CachedServiceInstance is immutable");
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public void setServiceInstanceId(String serviceInstanceId) {
        flagImmutable();
    }

    public void setOrganizationId(String organizationId) {
        flagImmutable();
    }

    public void setSpecificationId(String specificationId) {
        flagImmutable();
    }

    public void setName(String name) {
        flagImmutable();
    }

    public void setSummary(String summary) {
        flagImmutable();
    }

    public void setCoverage(List<Area> coverage) {
        flagImmutable();
    }

    public void setEndpoints(List<ServiceEndpoint> endpoints) {
        flagImmutable();
    }

    public Map<String, List<String>> getRoleUserMap() {
        return roleUserMap;
    }
}
