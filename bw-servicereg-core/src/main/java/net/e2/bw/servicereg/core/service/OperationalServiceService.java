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

import net.e2.bw.servicereg.model.OperationalService;

import java.util.List;

/**
 * Main maritime operational services service definition
 * <p/>
 * TODO: List of operational services is hardcoded by the TestDataLoaderService for now
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
public interface OperationalServiceService {

    /**
     * Returns the operational service with the given id
     *
     * @param operationalServiceId the ID of the operational service to look up
     * @return the operational service or null if not found
     */
    OperationalService getOperationalService(String operationalServiceId);

    /**
     * Returns the list of operational services
     *
     * @return the list of operational services
     */
    List<OperationalService> getOperationalServices();

}
