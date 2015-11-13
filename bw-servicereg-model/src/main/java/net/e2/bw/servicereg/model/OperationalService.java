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
 * Model object representing an operational service
 */
public class OperationalService implements JsonSerializable {

    private String operationalServiceId;
    private String organizationId;
    private String name;
    private String summary;

    /** Constructor */
    public OperationalService() {
    }

    /** Constructor */
    public OperationalService(String operationalServiceId, String organizationId, String name, String summary) {
        this.operationalServiceId = operationalServiceId;
        this.organizationId = organizationId;
        this.name = name;
        this.summary = summary;
    }

    /******************************/
    /** Getters and setters      **/
    /******************************/

    public String getOperationalServiceId() {
        return operationalServiceId;
    }

    public void setOperationalServiceId(String operationalServiceId) {
        this.operationalServiceId = operationalServiceId;
    }

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

}
