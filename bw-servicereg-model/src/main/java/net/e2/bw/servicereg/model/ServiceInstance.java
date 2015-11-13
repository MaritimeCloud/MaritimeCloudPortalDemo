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

import net.e2.bw.servicereg.model.coverage.Area;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Model object representing an service instance
 */
public class ServiceInstance implements JsonSerializable {

    private String serviceInstanceId;
    private String organizationId;
    private String specificationId;
    private String name;
    private String summary;
    private List<Area> coverage;
    private List<ServiceEndpoint> endpoints;

    /** Constructor */
    public ServiceInstance() {
        this.endpoints = new ArrayList<>();
    }

    void addEndpoint(ServiceEndpoint serviceEndpoint) {
        getEndpoints().add(serviceEndpoint);
    }

    void removeEndpoint(ServiceEndpoint serviceEndpoint) {
        getEndpoints().remove(serviceEndpoint);
    }

    /** Copies this service instance into the other */
    public ServiceInstance copyTo(ServiceInstance service) {
        Objects.requireNonNull(service);
        service.setServiceInstanceId(serviceInstanceId);
        service.setOrganizationId(organizationId);
        service.setSpecificationId(specificationId);
        service.setName(name);
        service.setSummary(summary);
        service.setCoverage(coverage != null ? new ArrayList<>(coverage) : null);
        service.setEndpoints(endpoints != null ? new ArrayList<>(endpoints) : null);
        return service;
    }

    /** Creates a copy of this service instance */
    public ServiceInstance copy() {
        return copyTo(new ServiceInstance());
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getServiceInstanceId() {
        return serviceInstanceId;
    }

    public void setServiceInstanceId(String serviceInstanceId) {
        this.serviceInstanceId = serviceInstanceId;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getSpecificationId() {
        return specificationId;
    }

    public void setSpecificationId(String specificationId) {
        this.specificationId = specificationId;
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

    public List<Area> getCoverage() {
        return coverage;
    }

    public void setCoverage(List<Area> coverage) {
        this.coverage = coverage;
    }

    public List<ServiceEndpoint> getEndpoints() {
        return endpoints;
    }

    public void setEndpoints(List<ServiceEndpoint> endpoints) {
        this.endpoints = endpoints;
    }
}
