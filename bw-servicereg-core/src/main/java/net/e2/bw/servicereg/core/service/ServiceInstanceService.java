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
package net.e2.bw.servicereg.core.service;

import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.ServiceInstance;
import net.e2.bw.servicereg.model.ServiceType;

import java.util.List;

/**
 * Main maritime service instance service definition
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public interface ServiceInstanceService {

    /**
     * Returns the service instance with the given id
     *
     * @param serviceInstanceId the ID of the service instance to look up
     * @return the service instance or null if not found
     */
    ServiceInstance getServiceInstance(String serviceInstanceId);

    /**
     * Returns the list of service instances matching the search criteria
     *
     * @param organizationId the associated organization
     * @param serviceType a  matching service type
     * @param anyTextPattern a text that must match the textual service attributes
     * @return the list of service instances
     */
    List<ServiceInstance> searchServiceInstances(String organizationId, ServiceType serviceType, String anyTextPattern);

    /**
     * Returns the list of service instances
     *
     * @return the list of service instances
     */
    default List<ServiceInstance> getServiceInstances() {
        return searchServiceInstances(null, null, null);
    }

    /**
     * Returns the users that are assigned to the given service instance.
     * The users will have their "serviceRoles" updated.
     *
     * @param serviceInstanceId the id of the service instance
     * @return the list of members
     */
    List<AuthorizedUser> getServiceInstanceUsers(String serviceInstanceId);

    /**
     * Assigns the given service role to the user.
     *
     * @param serviceInstanceId the id of the service instance
     * @param userId the id of the user
     * @param role the service role to assign
     */
    void assignServiceInstanceRole(String serviceInstanceId, String userId, String role);

    /**
     * Removes the given service role from the user.
     *
     * @param serviceInstanceId the id of the service instance
     * @param userId the id of the user
     * @param role the service role to remove
     */
    void removeServiceInstanceRole(String serviceInstanceId, String userId, String role);


    /**
     * Creates a new service instance based on the service instance template.
     *
     * @param serviceInstance the service instance template
     * @return the newly created service instance
     */
    ServiceInstance createServiceInstance(ServiceInstance serviceInstance);


    /**
     * Updates a service instance based on the service instance template.
     *
     * @param serviceInstance the service instance template
     * @return the updated created service instance
     */
    ServiceInstance updateServiceInstance(ServiceInstance serviceInstance);

}
