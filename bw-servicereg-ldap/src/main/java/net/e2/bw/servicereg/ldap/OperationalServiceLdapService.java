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

import net.e2.bw.servicereg.core.service.OperationalServiceService;
import net.e2.bw.servicereg.model.OperationalService;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * An LDAP specific implementation of the OperationalServiceService.
 * <p/>
 * NB: Authorization checks should be performed in the client code (i.e. REST endpoints)
 */
@Singleton
@Lock(LockType.READ)
@Startup
public class OperationalServiceLdapService implements OperationalServiceService {

    private List<OperationalService> operationalServices = new ArrayList<>();

    @Inject
    Logger log;

    /**
     * For now, the list of operational services is hardcoded
     */
    @PostConstruct
    void init() {

        operationalServices.add(new OperationalService("lps", "imo", "Local Port Services", "Summary of Local Port Services"));
        operationalServices.add(new OperationalService("mis", "imo", "Meteorological Information Services", "Summary of Meteorological Information Services"));
        operationalServices.add(new OperationalService("msi", "imo", "Maritime Safety Information", "Summary of Maritime Safety Information"));
        operationalServices.add(new OperationalService("msinm", "imo", "Maritime Safety Information & Notices to Mariners", "Summary of Maritime Safety Information & Notices to Mariners"));
        operationalServices.add(new OperationalService("nas", "imo", "Navigational Assistance Service", "Summary of Navigational Assistance Service"));
        operationalServices.add(new OperationalService("nga", "imo", "No-Go Area", "Summary of No-Go Area"));
        operationalServices.add(new OperationalService("rme", "imo", "Route METOC", "Summary of Route METOC"));
        operationalServices.add(new OperationalService("sre", "imo", "Strategical Route Exchange", "Summary of Strategical Route Exchange"));
        operationalServices.add(new OperationalService("tos", "imo", "Traffic Organization Service", "Summary of Traffic Organization Service"));
        operationalServices.add(new OperationalService("vsr", "imo", "Vessel Shore Reporting", "Summary of Vessel Shore Reporting"));
        operationalServices.add(new OperationalService("wvtsg", "imo", "World Vessel Traffic Services Guide", "Summary of World Vessel Traffic Services Guide"));
        operationalServices.add(new OperationalService("tre", "imo", "Tactical Route Exchange", "Summary of Tactical Route Exchange"));
        operationalServices.add(new OperationalService("tus", "imo", "Tugs Services", "Summary of Tugs Services"));

    }

    /** {@inheritDoc} */
    @Override
    public OperationalService getOperationalService(String operationalServiceId) {
        return operationalServices.stream()
                .filter(s -> s.getOperationalServiceId().equals(operationalServiceId))
                .findFirst()
                .orElse(null);
    }

    /** {@inheritDoc} */
    @Override
    public List<OperationalService> getOperationalServices() {
        return operationalServices;
    }

}
