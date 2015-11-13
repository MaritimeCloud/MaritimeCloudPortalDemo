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
package net.e2.bw.servicereg.core;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Encapsulates the different type of roles
 */
public class Roles {

    /** Interface implemented by hierarchical roles */
    public interface HierarchicalRole<T> {
        Set<T> getEffectiveRoles();
    }

    /** Represents an organizational role */
    public enum OrganizationRole implements HierarchicalRole<OrganizationRole> {
        applicant,
        invited,
        user,
        userAdmin(user),
        admin(userAdmin);

        private Set<OrganizationRole> effectiveRoles = new HashSet<>();

        OrganizationRole(OrganizationRole... impliedRoles) {
            effectiveRoles.add(this);
            if (impliedRoles != null) {
                Arrays.stream(impliedRoles)
                        .forEach(r -> effectiveRoles.addAll(r.effectiveRoles));
            }
        }

        @Override
        public Set<OrganizationRole> getEffectiveRoles() {
            return effectiveRoles;
        }
    }

    /** Represents a service role */
    public enum ServiceRole implements HierarchicalRole<ServiceRole> {
        user,
        admin(user);

        private Set<ServiceRole> effectiveRoles = new HashSet<>();

        ServiceRole(ServiceRole... impliedRoles) {
            effectiveRoles.add(this);
            if (impliedRoles != null) {
                Arrays.stream(impliedRoles)
                        .forEach(r -> effectiveRoles.addAll(r.effectiveRoles));
            }
        }

        @Override
        public Set<ServiceRole> getEffectiveRoles() {
            return effectiveRoles;
        }
    }

    /** Computes the set effective set of organization roles as Strings */
    public static Set<String> effectiveOrganizationRoles(String... roles) {
        if (roles != null) {
            return Arrays.stream(roles)
                    .map(OrganizationRole::valueOf)                // Convert to OrganizationRole
                    .flatMap(r -> r.getEffectiveRoles().stream())  // Compute effective role set
                    .map(Enum::name)                               // Back to string
                    .collect(Collectors.toSet());
        }
        return null;
    }

    /** Computes the set effective set of service roles as Strings */
    public static Set<String> effectiveServiceRoles(String... roles) {
        if (roles != null) {
            return Arrays.stream(roles)
                    .map(ServiceRole::valueOf)                     // Convert to SiteRole
                    .flatMap(r -> r.getEffectiveRoles().stream())  // Compute effective role set
                    .map(Enum::name)                               // Back to string
                    .collect(Collectors.toSet());
        }
        return null;
    }
}
