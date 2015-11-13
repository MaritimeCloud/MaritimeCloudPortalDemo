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
package net.e2.bw.servicereg.model;

/**
 * A subclass of the UserEntry that contains the user roles relative to a site or an organization
 */
public class AuthorizedUser extends User {

    private String[] siteRoles;
    private String[] serviceRoles;
    private String[] organizationRoles;

    /** Copies the data of this user to the given user */
    public AuthorizedUser copyTo(AuthorizedUser user) {
        super.copyTo(user);
        user.setSiteRoles(siteRoles);
        user.setServiceRoles(serviceRoles);
        user.setOrganizationRoles(organizationRoles);
        return user;
    }

    /** Creates a copy of this user */
    public AuthorizedUser copy() {
        return copyTo(new AuthorizedUser());
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String[] getSiteRoles() {
        return siteRoles;
    }

    public void setSiteRoles(String[] siteRoles) {
        this.siteRoles = siteRoles;
    }

    public String[] getServiceRoles() {
        return serviceRoles;
    }

    public void setServiceRoles(String[] serviceRoles) {
        this.serviceRoles = serviceRoles;
    }

    public String[] getOrganizationRoles() {
        return organizationRoles;
    }

    public void setOrganizationRoles(String[] organizationRoles) {
        this.organizationRoles = organizationRoles;
    }

}
