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

import net.e2.bw.servicereg.model.ServiceSpecification;
import net.e2.bw.servicereg.model.ServiceType;

/**
 * An immutable ServiceSpecification implementation suitable for caching.
 */
public class CachedServiceSpecification extends ServiceSpecification {

    /** Constructor */
    public CachedServiceSpecification(String serviceSpecificationId, String organizationId, String name, String summary, ServiceType serviceType) {
        super(serviceSpecificationId, organizationId, name, summary, serviceType);
    }

    /** Called by setter methods to flag that the class is immutable */
    private void flagImmutable() {
        throw new UnsupportedOperationException("CachedServiceSpecification is immutable");
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public void setServiceSpecificationId(String serviceSpecificationId) {
        flagImmutable();
    }

    public void setOrganizationId(String organizationId) {
        flagImmutable();
    }

    public void setServiceType(ServiceType serviceType) {
        flagImmutable();
    }

    public void setName(String name) {
        flagImmutable();
    }

    public void setSummary(String summary) {
        flagImmutable();
    }
}
