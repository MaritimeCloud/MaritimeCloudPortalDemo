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
 * A subclass of the Organization that contain the roles for a specific user within the organization
 */
public class UserOrganization extends Organization {

    /** The user id */
    private String userId;

    /** List of organization roles for a specific user */
    private String[] userRoles;

    /** The number of member applications */
    private int applicantNo;

    /** Copies this organization into the other */
    public UserOrganization copyTo(UserOrganization org) {
        super.copyTo(org);
        return org;
    }

    /** Creates a copy of this organization */
    public UserOrganization copy() {
        return copyTo(new UserOrganization());
    }


    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String[] getUserRoles() {
        return userRoles;
    }

    public void setUserRoles(String[] userRoles) {
        this.userRoles = userRoles;
    }

    public int getApplicantNo() {
        return applicantNo;
    }

    public void setApplicantNo(int applicantNo) {
        this.applicantNo = applicantNo;
    }
}
