/* Copyright 2014 Danish Maritime Authority.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package net.e2.bw.servicereg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.*;

/**
 * Model object representing an organization
 */
public class Organization implements JsonSerializable {

    private String organizationId;
    private String name;
    private String summary;
    private String url;
    private String country;

    @JsonIgnore
    private byte[] logo;


    /** Constructor */
    public Organization() {
    }

    /** Copies this organization into the other */
    public Organization copyTo(Organization org) {
        Objects.requireNonNull(org);
        org.setOrganizationId(organizationId);
        org.setName(name);
        org.setSummary(summary);
        org.setUrl(url);
        org.setCountry(country);
        org.setLogo(logo);
        return org;
    }

    /** Creates a copy of this organization */
    public Organization copy() {
        return copyTo(new Organization());
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public byte[] getLogo() {
        return logo;
    }

    public void setLogo(byte[] logo) {
        this.logo = logo;
    }
}
