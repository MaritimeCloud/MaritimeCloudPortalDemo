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

/**
 * Model object representing a service specification
 */
public class ServiceSpecification implements JsonSerializable {

    private String serviceSpecificationId;
    private String organizationId;
    private String name;
    private String summary;
    private ServiceType serviceType;

    /** Constructor */
    public ServiceSpecification() {
    }

    /** Constructor */
    public ServiceSpecification(String serviceSpecificationId, String organizationId, String name, String summary, ServiceType serviceType) {
        this.serviceSpecificationId = serviceSpecificationId;
        this.organizationId = organizationId;
        this.name = name;
        this.summary = summary;
        this.serviceType = serviceType;
    }

    /** Copies the data of this service specification to the given service specification */
    public ServiceSpecification copyTo(ServiceSpecification spec) {
        spec.setServiceSpecificationId(serviceSpecificationId);
        spec.setOrganizationId(organizationId);
        spec.setName(name);
        spec.setSummary(summary);
        spec.setServiceType(serviceType);
        return spec;
    }

    /** Creates a copy of this service specification */
    public ServiceSpecification copy() {
        return copyTo(new ServiceSpecification());
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getServiceSpecificationId() {
        return serviceSpecificationId;
    }

    public void setServiceSpecificationId(String serviceSpecificationId) {
        this.serviceSpecificationId = serviceSpecificationId;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
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

}
