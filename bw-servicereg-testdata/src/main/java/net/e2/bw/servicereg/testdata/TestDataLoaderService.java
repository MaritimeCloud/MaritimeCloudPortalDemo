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
package net.e2.bw.servicereg.testdata;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.e2.bw.servicereg.core.service.ServiceInstanceService;
import net.e2.bw.servicereg.core.service.ServiceSpecificationService;
import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.model.ServiceInstance;
import net.e2.bw.servicereg.model.ServiceSpecification;
import net.e2.bw.servicereg.model.ServiceType;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * This class will load test data into the system
 */
@Singleton
@Lock(LockType.READ)
@Startup
public class TestDataLoaderService {

    private List<ServiceSpecification> serviceSpecifications = new ArrayList<>();
    private List<ServiceInstance> serviceInstances = new ArrayList<>();

    @Inject
    Logger log;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    ServiceSpecificationService serviceSpecificationService;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    ServiceInstanceService serviceInstanceService;

    /**
     * Called when the system starts up. Check is test data needs to be loaded
     */
    @PostConstruct
    void init() {


        serviceSpecifications.add(new ServiceSpecification(
                "imo-mcservicereg-rest",
                "dma",
                "MC Service Registry (rest)",
                "Maritime Cloud Service Registry provided as a REST API",
                ServiceType.REST
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-mcservicereg-www",
                "dma",
                "MC Service Registry (www)",
                "Maritime Cloud Service Registry provided as a website",
                ServiceType.WWW
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-mis-rest",
                "dma",
                "METOC en route (rest)",
                "Meteorological services provided as a REST api operational services: mis",
                ServiceType.REST
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-mis-www",
                "dma",
                "METOC en route (www)",
                "Meteorological services provided on the internet operational services: mis",
                ServiceType.WWW
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msi-soap",
                "dma",
                "MSI (soap)",
                "Maritime Safety Information provided as a SOAP-service operational services: msi",
                ServiceType.SOAP
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msi-mms",
                "dma",
                "MSI (mms)",
                "Maritime Safety Information provided over the MMS protocol operational services: msi",
                ServiceType.MMS
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msinm-mms",
                "dma",
                "MSI-NM (mms)",
                "Maritime Safety Information & Notices to Mariners provided over the MMS protocol operational services: msinm",
                ServiceType.MMS
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msinm-www",
                "dma",
                "MSI-NM (www)",
                "Maritime Safety Information & Notices to Mariners provided as an internet website operational services: msinm",
                ServiceType.WWW
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msi-navtext",
                "dma",
                "MSI (navtext)",
                "Maritime Safety Information provided as a NAVTEX-service operational services: msi",
                ServiceType.NAVTEX
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msi-vhf",
                "dma",
                "MSI (vhf)",
                "Maritime Safety Information broadcasted on VHF operational services: msi",
                ServiceType.VHF
        ));
        serviceSpecifications.add(new ServiceSpecification(
                "imo-msi-www",
                "dma",
                "MSI (www)",
                "Maritime Safety Information provided on the internet operational services: msi",
                ServiceType.WWW
        ));

        checkCreateServiceSpecifications();

        try {
            ObjectMapper mapper = new ObjectMapper();
            serviceInstances = mapper.readValue(getClass().getResource("/service-instances.json"), new TypeReference<List<ServiceInstance>>(){});
        } catch (IOException e) {
            e.printStackTrace();
        }

        checkCreateServiceInstances();

        // Lastly, assign a super site admin for the Maritime Cloud Service Registry
        try {
            String serviceRegistryId = "dma-imo-mcservicereg-www-1";
            String serviceRegistryAdmin = "ged";
            AuthorizedUser adminUser = serviceInstanceService.getServiceInstanceUsers(serviceRegistryId).stream()
                    .filter(u -> u.getUserId().equals(serviceRegistryAdmin))
                    .findFirst()
                    .orElse(null);
            if (adminUser == null) {
                serviceInstanceService.assignServiceInstanceRole(serviceRegistryId, serviceRegistryAdmin, "admin");
                log.info("TEST DATA: Created admin user " + serviceRegistryAdmin + " for service " + serviceRegistryId);
            }
        } catch (Exception ignored) {
        }
    }

    /**
     * Check if the test data service specifications exists in the back-end. Otherwise creates them
     */
    private void checkCreateServiceSpecifications() {
        serviceSpecifications.forEach(spec -> {
            try {
                ServiceSpecification existingSpec = serviceSpecificationService.getServiceSpecification(spec.getServiceSpecificationId());
                if (existingSpec == null) {
                    serviceSpecificationService.createServiceSpecification(spec);
                    log.info("TEST DATA: Created service specification " + spec.getServiceSpecificationId());
                }

            } catch (Exception ex) {
                log.error("TEST DATA: Failed creating service specification " + spec.getServiceSpecificationId(), ex);
            }
        });
    }

    /**
     * Check if the test data service instances exists in the back-end. Otherwise creates them
     */
    private void checkCreateServiceInstances() {
        serviceInstances.forEach(service -> {
            try {
                ServiceInstance existingService = serviceInstanceService.getServiceInstance(service.getServiceInstanceId());
                if (existingService == null) {
                    serviceInstanceService.createServiceInstance(service);
                    log.info("TEST DATA: Created service instance " + service.getServiceInstanceId());
                }

            } catch (Exception ex) {
                log.error("TEST DATA: Failed creating service instance " + service.getServiceInstanceId(), ex);
            }
        });
    }

}
