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

import net.e2.bw.servicereg.model.ServiceSpecification;

import java.util.List;

/**
 * Main maritime service specification service definition
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public interface ServiceSpecificationService {

    /**
     * Returns the service specification with the given id
     *
     * @param serviceSpecificationId the ID of the service specification to look up
     * @return the service specification or null if not found
     */
    ServiceSpecification getServiceSpecification(String serviceSpecificationId);

    /**
     * Returns the list of service specifications
     *
     * @return the list of service specifications
     */
    List<ServiceSpecification> getServiceSpecifications();

    /**
     * Creates a new service specification based on the service specification template.
     *
     * @param serviceSpecification the service specification template
     * @return the newly created service specification
     */
    ServiceSpecification createServiceSpecification(ServiceSpecification serviceSpecification);


    /**
     * Updates a service specification based on the service specification template.
     *
     * @param serviceSpecification the service specification template
     * @return the updated created service specification
     */
    ServiceSpecification updateServiceSpecification(ServiceSpecification serviceSpecification);

}
