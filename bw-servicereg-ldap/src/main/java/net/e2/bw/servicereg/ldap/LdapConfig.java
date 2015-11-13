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
package net.e2.bw.servicereg.ldap;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

import java.io.Reader;
import java.util.Arrays;
import java.util.Properties;

/**
 * Defines LDAP configuration parameters.
 */
public class LdapConfig {

    private String vendor;
    private String connectionUrl;
    private String bindDN;
    private Object bindCredential;
    private String binaryAttributes;
    private String userSearchDN;
    private String userRDNAttribute;
    private String userUidAttribute;
    private String userObjectClasses;
    private String groupSearchDN;
    private String groupSearchObjectClass;
    private String groupRDNAttribute;
    private String groupUidAttribute;
    private String groupMemberAttribute;
    private String groupObjectClasses;
    private String roleSearchObjectClass;
    private String roleRDNAttribute;
    private String roleMemberAttribute;
    private String serviceSpecSearchDN;
    private String serviceSpecRDNAttribute;
    private String serviceSpecUidAttribute;
    private String serviceSpecObjectClasses;
    private String serviceInstanceSearchDN;
    private String serviceInstanceRDNAttribute;
    private String serviceInstanceUidAttribute;
    private String serviceInstanceObjectClasses;

    public String getContextFactory() {
        return "com.sun.jndi.ldap.LdapCtxFactory";
    }

    public static Builder newBuilder() {
        return new Builder();
    }

    public String getVendor() {
        return vendor;
    }

    public String getConnectionUrl() {
        return connectionUrl;
    }

    public String getBindDN() {
        return bindDN;
    }

    public Object getBindCredential() {
        return bindCredential;
    }

    public String getBinaryAttributes() {
        return binaryAttributes;
    }

    public String getUserSearchDN() {
        return userSearchDN;
    }

    public String getUserRDNAttribute() {
        return userRDNAttribute;
    }

    public String getUserUidAttribute() {
        return userUidAttribute;
    }

    public String getUserObjectClasses() {
        return userObjectClasses;
    }

    public String getGroupSearchDN() {
        return groupSearchDN;
    }

    public String getGroupSearchObjectClass() {
        return groupSearchObjectClass;
    }

    public String getGroupRDNAttribute() {
        return groupRDNAttribute;
    }

    public String getGroupUidAttribute() {
        return groupUidAttribute;
    }

    public String getGroupMemberAttribute() {
        return groupMemberAttribute;
    }

    public String getGroupObjectClasses() {
        return groupObjectClasses;
    }

    public String getRoleSearchObjectClass() {
        return roleSearchObjectClass;
    }

    public String getRoleRDNAttribute() {
        return roleRDNAttribute;
    }

    public String getRoleMemberAttribute() {
        return roleMemberAttribute;
    }

    public String getServiceSpecSearchDN() {
        return serviceSpecSearchDN;
    }

    public String getServiceSpecRDNAttribute() {
        return serviceSpecRDNAttribute;
    }

    public String getServiceSpecUidAttribute() {
        return serviceSpecUidAttribute;
    }

    public String getServiceSpecObjectClasses() {
        return serviceSpecObjectClasses;
    }

    public String getServiceInstanceSearchDN() {
        return serviceInstanceSearchDN;
    }

    public String getServiceInstanceRDNAttribute() {
        return serviceInstanceRDNAttribute;
    }

    public String getServiceInstanceUidAttribute() {
        return serviceInstanceUidAttribute;
    }

    public String getServiceInstanceObjectClasses() {
        return serviceInstanceObjectClasses;
    }

    /**
     * Builder class
     */
    public static class Builder {
        LdapConfig cfg = new LdapConfig();

        protected Properties properties;
        protected Reader configFile;

        private Builder() {
        }

        public Builder configuration(Reader configFile) {
            this.configFile = configFile;
            return this;
        }

        public Builder setVendor(String vendor) {
            cfg.vendor = vendor;
            return this;
        }

        public Builder setConnectionUrl(String connectionUrl) {
            cfg.connectionUrl = connectionUrl;
            return this;
        }

        public Builder setBindDN(String bindDN) {
            cfg.bindDN = bindDN;
            return this;
        }

        public Builder setBindCredential(Object bindCredential) {
            cfg.bindCredential = bindCredential;
            return this;
        }

        public Builder setUserSearchDN(String userSearchDN) {
            cfg.userSearchDN = userSearchDN;
            return this;
        }

        public Builder setBinaryAttributes(String binaryAttributes) {
            cfg.binaryAttributes = binaryAttributes;
            return this;
        }

        public Builder setUserRDNAttribute(String userRDNAttribute) {
            cfg.userRDNAttribute = userRDNAttribute;
            return this;
        }

        public Builder setUserUidAttribute(String userUidAttribute) {
            cfg.userUidAttribute = userUidAttribute;
            return this;
        }

        public Builder setUserObjectClasses(String userObjectClasses) {
            cfg.userObjectClasses = userObjectClasses;
            return this;
        }

        public Builder setGroupSearchDN(String groupSearchDN) {
            cfg.groupSearchDN = groupSearchDN;
            return this;
        }

        public Builder setGroupSearchObjectClass(String groupSearchObjectClass) {
            cfg.groupSearchObjectClass = groupSearchObjectClass;
            return this;
        }

        public Builder setGroupRDNAttribute(String groupRDNAttribute) {
            cfg.groupRDNAttribute = groupRDNAttribute;
            return this;
        }

        public Builder setGroupUidAttribute(String groupUidAttribute) {
            cfg.groupUidAttribute = groupUidAttribute;
            return this;
        }

        public Builder setGroupMemberAttribute(String groupMemberAttribute) {
            cfg.groupMemberAttribute = groupMemberAttribute;
            return this;
        }

        public Builder setGroupObjectClasses(String groupObjectClasses) {
            cfg.groupObjectClasses = groupObjectClasses;
            return this;
        }

        public Builder setRoleSearchObjectClass(String roleSearchObjectClass) {
            cfg.roleSearchObjectClass = roleSearchObjectClass;
            return this;
        }

        public Builder setRoleRDNAttribute(String roleRDNAttribute) {
            cfg.roleRDNAttribute = roleRDNAttribute;
            return this;
        }

        public Builder setRoleMemberAttribute(String roleMemberAttribute) {
            cfg.roleMemberAttribute = roleMemberAttribute;
            return this;
        }

        public Builder setServiceSpecSearchDN(String serviceSpecSearchDN) {
            cfg.serviceSpecSearchDN = serviceSpecSearchDN;
            return this;
        }

        public Builder setServiceSpecRDNAttribute(String serviceSpecRDNAttribute) {
            cfg.serviceSpecRDNAttribute = serviceSpecRDNAttribute;
            return this;
        }

        public Builder setServiceSpecUidAttribute(String serviceSpecUidAttribute) {
            cfg.serviceSpecUidAttribute = serviceSpecUidAttribute;
            return this;
        }

        public Builder setServiceSpecObjectClasses(String serviceSpecObjectClasses) {
            cfg.serviceSpecObjectClasses = serviceSpecObjectClasses;
            return this;
        }

        public Builder setServiceInstanceSearchDN(String serviceInstanceSearchDN) {
            cfg.serviceInstanceSearchDN = serviceInstanceSearchDN;
            return this;
        }

        public Builder setServiceInstanceRDNAttribute(String serviceInstanceRDNAttribute) {
            cfg.serviceInstanceRDNAttribute = serviceInstanceRDNAttribute;
            return this;
        }

        public Builder setServiceInstanceUidAttribute(String serviceInstanceUidAttribute) {
            cfg.serviceInstanceUidAttribute = serviceInstanceUidAttribute;
            return this;
        }

        public Builder setServiceInstanceObjectClasses(String serviceInstanceObjectClasses) {
            cfg.serviceInstanceObjectClasses = serviceInstanceObjectClasses;
            return this;
        }

        /**
         * Construct a new LdapConfig object
         */
        public LdapConfig build() throws Exception {

            Config fileConf = null;
            if (configFile != null) {
                fileConf = ConfigFactory.parseReader(configFile);
            }

            // Update the configuration properties. Order of precedence:
            //  1) Properties set directly
            //  2) Properties from the configuration file
            //  3) Default values
            setVendor(firstDefined(
                    cfg.getVendor(),
                    getConfig(fileConf, "vendor"),
                    "ApacheDS"));
            setConnectionUrl(firstDefined(
                    cfg.getConnectionUrl(),
                    getConfig(fileConf, "connection-url"),
                    "ldap://localhost:10389"));
            setBindDN(firstDefined(
                    cfg.getBindDN(),
                    getConfig(fileConf, "bind-dn"),
                    "uid=admin,ou=system"));
            setBindCredential(firstDefined(
                    cfg.getBindCredential(),
                    getConfig(fileConf, "bind-credential"),
                    "secret"));
            setBinaryAttributes(firstDefined(
                    cfg.getBinaryAttributes(),
                    getConfig(fileConf, "binary-attributes"),
                    "serviceCoverage"));

            setUserSearchDN(firstDefined(
                    cfg.getUserSearchDN(),
                    getConfig(fileConf, "user-search-dn"),
                    "ou=people,dc=balticweb,dc=net"));
            setUserRDNAttribute(firstDefined(
                    cfg.getUserRDNAttribute(),
                    getConfig(fileConf, "user-rdn-attribute"),
                    "uid"));
            setUserUidAttribute(firstDefined(
                    cfg.getUserUidAttribute(),
                    getConfig(fileConf, "user-uid-attribute"),
                    "uid"));
            setUserObjectClasses(firstDefined(
                    cfg.getUserObjectClasses(),
                    getConfig(fileConf, "user-object-classes"),
                    "top,inetOrgPerson,organizationalPerson,maritimeResource"));

            setGroupSearchDN(firstDefined(
                    cfg.getGroupSearchDN(),
                    getConfig(fileConf, "group-search-dn"),
                    "ou=groups,dc=balticweb,dc=net"));
            setGroupSearchObjectClass(firstDefined(
                    cfg.getGroupSearchObjectClass(),
                    getConfig(fileConf, "group-search-object-class"),
                    "maritimeOrganization"));
            setGroupRDNAttribute(firstDefined(
                    cfg.getGroupRDNAttribute(),
                    getConfig(fileConf, "group-rdn-attribute"),
                    "cn"));
            setGroupUidAttribute(firstDefined(
                    cfg.getGroupUidAttribute(),
                    getConfig(fileConf, "group-uid-attribute"),
                    "uid"));
            setGroupMemberAttribute(firstDefined(
                    cfg.getGroupMemberAttribute(),
                    getConfig(fileConf, "group-member-attribute"),
                    "uniqueMember"));
            setGroupObjectClasses(firstDefined(
                    cfg.getGroupObjectClasses(),
                    getConfig(fileConf, "group-object-classes"),
                    "top,groupOfUniqueNames,maritimeOrganization,maritimeResource"));

            setRoleSearchObjectClass(firstDefined(
                    cfg.getRoleSearchObjectClass(),
                    getConfig(fileConf, "role-search-object-class"),
                    "organizationalRole"));
            setRoleRDNAttribute(firstDefined(
                    cfg.getRoleRDNAttribute(),
                    getConfig(fileConf, "role-rdn-attribute"),
                    "cn"));
            setRoleMemberAttribute(firstDefined(
                    cfg.getRoleMemberAttribute(),
                    getConfig(fileConf, "role-member-attribute"),
                    "roleOccupant"));

            setServiceSpecSearchDN(firstDefined(
                    cfg.getServiceSpecSearchDN(),
                    getConfig(fileConf, "service-spec-search-dn"),
                    "ou=service-specs,dc=balticweb,dc=net"));
            setServiceSpecRDNAttribute(firstDefined(
                    cfg.getServiceSpecRDNAttribute(),
                    getConfig(fileConf, "service-spec-rdn-attribute"),
                    "uid"));
            setServiceSpecUidAttribute(firstDefined(
                    cfg.getServiceSpecUidAttribute(),
                    getConfig(fileConf, "service-spec-uid-attribute"),
                    "uid"));
            setServiceSpecObjectClasses(firstDefined(
                    cfg.getServiceSpecObjectClasses(),
                    getConfig(fileConf, "service-spec-object-classes"),
                    "top,maritimeServiceSpec"));

            setServiceInstanceSearchDN(firstDefined(
                    cfg.getServiceInstanceSearchDN(),
                    getConfig(fileConf, "service-instance-search-dn"),
                    "ou=services,dc=balticweb,dc=net"));
            setServiceInstanceRDNAttribute(firstDefined(
                    cfg.getServiceInstanceRDNAttribute(),
                    getConfig(fileConf, "service-instance-rdn-attribute"),
                    "uid"));
            setServiceInstanceUidAttribute(firstDefined(
                    cfg.getServiceInstanceUidAttribute(),
                    getConfig(fileConf, "service-instance-uid-attribute"),
                    "uid"));
            setServiceInstanceObjectClasses(firstDefined(
                    cfg.getServiceInstanceObjectClasses(),
                    getConfig(fileConf, "service-instance-object-classes"),
                    "top,maritimeService"));


            // TODO: Validate the required attributes have been set, or throw exception

            return cfg;
        }


        /** If defined, returns the path value of the configuration entity, otherwise null */
        public String getConfig(Config config, String path) {
            return config != null && config.hasPath(path) ? config.getString(path) : null;
        }

        /** Returns the first non-null value from the list */
        @SafeVarargs
        public final <T> T firstDefined(T... values) {
            if (values != null) {
                return Arrays.stream(values)
                        .filter(v -> v != null)
                        .findFirst()
                        .orElse(null);
            }
            return null;
        }
    }
}
