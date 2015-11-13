package net.e2.bw.servicereg.ldap;

import net.e2.bw.servicereg.ldap.model.CachedOrganization;
import net.e2.bw.servicereg.ldap.model.CachedServiceInstance;
import net.e2.bw.servicereg.ldap.model.CachedServiceSpecification;
import net.e2.bw.servicereg.ldap.model.CachedUser;
import org.infinispan.Cache;
import org.infinispan.configuration.cache.CacheMode;
import org.infinispan.configuration.cache.Configuration;
import org.infinispan.configuration.cache.ConfigurationBuilder;
import org.infinispan.configuration.global.GlobalConfiguration;
import org.infinispan.configuration.global.GlobalConfigurationBuilder;
import org.infinispan.eviction.EvictionStrategy;
import org.infinispan.manager.DefaultCacheManager;
import org.infinispan.manager.EmbeddedCacheManager;
import org.infinispan.util.concurrent.IsolationLevel;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

/**
 * Creates Infinispan caches to be used for caching LDAP entries
 */
@Singleton
@Startup
@Lock(LockType.READ)
public class LdapCache {

    final static long LIFESPAN = 5 * 60 * 1000;     // 5 minutes
    final static long MAX_ENTRIES = 20000;          // at most 20.000 entries

    final static String USER_CACHE = "userCache";
    final static String ORGANIZATION_CACHE = "organizationCache";
    final static String SERVICE_SPECIFICATION_CACHE = "serviceSpecificationCache";
    final static String SERVICE_INSTANCE_CACHE = "serviceInstanceCache";

    @Inject
    private Logger log;

    protected EmbeddedCacheManager cacheContainer;

    /**
     * Starts the cache container
     */
    @PostConstruct
    public void initCacheContainer() {
        if (cacheContainer == null) {

            GlobalConfiguration globalConfiguration = new GlobalConfigurationBuilder()
                    .nonClusteredDefault() // Default constructed GlobalConfiguration, pre-configured for use in LOCAL mode
                    .globalJmxStatistics().allowDuplicateDomains(true)
                    .build(); //Builds  the GlobalConfiguration object

            Configuration localConfiguration = new ConfigurationBuilder()
                    .clustering().cacheMode(CacheMode.LOCAL)
                    .locking().isolationLevel(IsolationLevel.REPEATABLE_READ)
                    .eviction().maxEntries(MAX_ENTRIES).strategy(EvictionStrategy.LRU)
                    .expiration().lifespan(LIFESPAN)
                    .build();
            cacheContainer = new DefaultCacheManager(globalConfiguration, localConfiguration, true);
            log.info("Init cache container");
        }
    }

    /**
     * Stops the cache container
     */
    @PreDestroy
    public void destroyCacheContainer() {
        if (cacheContainer != null) {
            cacheContainer.stop();
            cacheContainer = null;
            log.info("Stopped cache container");
        }
    }

    /**
     * Returns a reference to the user entry cache
     * @return a reference to the user entry cache
     */
    public Cache<String, CachedUser> getUserCache() {
        return cacheContainer.getCache(USER_CACHE);
    }

    /**
     * Returns a reference to the organization entry cache
     * @return a reference to the organization entry cache
     */
    public Cache<String, CachedOrganization> getOrganizationCache() {
        return cacheContainer.getCache(ORGANIZATION_CACHE);
    }

    /**
     * Returns a reference to the service specification entry cache
     * @return a reference to the service specification entry cache
     */
    public Cache<String, CachedServiceSpecification> getServiceSpecificationCache() {
        return cacheContainer.getCache(SERVICE_SPECIFICATION_CACHE);
    }

    /**
     * Returns a reference to the service instance entry cache
     * @return a reference to the service instance entry cache
     */
    public Cache<String, CachedServiceInstance> getServiceInstanceCache() {
        return cacheContainer.getCache(SERVICE_INSTANCE_CACHE);
    }
}
