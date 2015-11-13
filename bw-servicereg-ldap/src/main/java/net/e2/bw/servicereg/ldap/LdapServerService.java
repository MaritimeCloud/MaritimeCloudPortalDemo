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

import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import javax.naming.*;
import javax.naming.directory.*;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;
import java.io.*;
import java.util.*;

/**
 * Main LDAP server interface.
 * <p/>
 * Give credit to whom credit is due: Some of the functionality has been inspired
 * by the JBoss Keycloak LDAPOperationManager class.
 */
@Singleton
@Lock(LockType.READ)
@Startup
@SuppressWarnings("unused")
public class LdapServerService {

    @Inject
    Logger log;

    LdapConfig ldapConfig;

    public LdapConfig getConfig() {
        return ldapConfig;
    }

    /*******************************/
    /** Initialization            **/
    /*******************************/

    /**
     * Initializes the LDAP configuration.
     *
     * Loads configuration file specified by the "bw-ldap.conf" system property.
     * If undefined, use "bw-ldap.conf" in classpath which points to a local development LDAP server
     */
    @PostConstruct
    void init() {

        // Set LDAP system properties
        checkLdapSystemProperty("authentication", "none simple");
        checkLdapSystemProperty("initsize", "1");
        checkLdapSystemProperty("maxsize", "1000");
        checkLdapSystemProperty("prefsize", "5");
        checkLdapSystemProperty("timeout", "300000");
        checkLdapSystemProperty("protocol", "plain");
        checkLdapSystemProperty("debug", "off");

        // Initialize the LDAP configuration
        try {
            String filePath = System.getProperty("bw-ldap.conf");

            // Use bw-ldap.conf defined by system property. Otherwise, use bw-ldap.json in classpath
            InputStream ldapConfigFile = (filePath != null)
                    ? new FileInputStream(new File(filePath))
                    : LdapServerService.class.getResourceAsStream("/bw-ldap.conf");

            try (Reader configFile = new InputStreamReader(ldapConfigFile)) {
                ldapConfig = LdapConfig.newBuilder()
                        .configuration(configFile)
                        .build();
            }

            log.info("Initialized LDAP service ");
        } catch (Exception e) {
            log.error("Error initializing the LDAP service", e);

            // Prevent the webapp from launching
            throw new RuntimeException(e);
        }
    }

    /** Sets the given LDAP-related system property */
    private static void checkLdapSystemProperty(String name, String defaultValue) {
        name = "com.sun.jndi.ldap.connect.pool." + name;
        if (System.getProperty(name) == null) {
            System.setProperty(name, defaultValue);
        }
    }

    /*******************************/
    /** Generic LDAP Operations   **/
    /*******************************/

    /** Returns the attributes for the given LDAP entry */
    public Attributes getAttributes(String dn, Set<String> attrs) throws NamingException {
        attrs = getReturningAttributes(attrs);
        final String[] attributes = attrs.toArray(new String[attrs.size()]);
        try {
            log.debug("Fetching attributes for DN " + dn);
            return execute(ctx -> ctx.getAttributes(dn, attributes));
        } catch (NamingException e) {
            log.error("Error fetching attributes for DN " + dn);
            throw e;
        }
    }

    /** Returns the given attribute for the given LDAP entry */
    public Attribute getAttribute(String dn, String attr) throws NamingException {
        Set<String> attributes = new HashSet<>();
        attributes.add(attr);
        return getAttributes(dn, attributes).get(attr);
    }

    /** Adds a value to a multivalued attribute if it does not exist already */
    public void addUniqueAttributeValue(String dn, String attr, Object value) throws NamingException {
        Attribute attribute = getAttribute(dn, attr);
        Attribute updatedAttribute = new BasicAttribute(attr);

        // Check if the value needs to be added
        for (int i = 0; attribute != null && i < attribute.size(); ++i) {
            try {
                Object attrValue = attribute.get(i);
                // If user already exists in the role entry, we're done...
                if (attrValue.equals(value)) {
                    return;
                }
                updatedAttribute.add(attrValue);
            } catch (NamingException ignored) {
            }
        }
        updatedAttribute.add(value);
        modifyAttribute(dn, updatedAttribute);
    }

    /** Removed a value from a multivalued attribute */
    public void removeAttributeValue(String dn, String attr, Object value, boolean removeEntryWhenAttrEmpty) throws NamingException {
        Attribute attribute = getAttribute(dn, attr);
        Attribute updatedAttribute = new BasicAttribute(attr);

        // Check if the value needs to be removed
        for (int i = 0; attribute != null && i < attribute.size(); ++i) {
            try {
                Object attrValue = attribute.get(i);
                if (!attrValue.equals(value)) {
                    updatedAttribute.add(attrValue);
                }
            } catch (NamingException ignored) {
            }
        }

        // If the value was not found, do not update ldap
        if (attribute == null || attribute.size() == updatedAttribute.size()) {
            return;
        } else if (updatedAttribute.size() == 0 && removeEntryWhenAttrEmpty) {
            removeEntry(dn);
            return;
        }

        // Update the attribute with the value removed
        modifyAttribute(dn, updatedAttribute);
    }

    /** Modifies the given attribute for the given DN */
    public void modifyAttribute(String dn, Attribute attribute) throws NamingException {
        modifyAttributes(dn, new ModificationItem[]{new ModificationItem(DirContext.REPLACE_ATTRIBUTE, attribute)});
    }

    /** Modifies the given attributes for the given DN */
    public void modifyAttributes(String dn,  NamingEnumeration<Attribute> attributes) throws NamingException {
        List<ModificationItem> modItems = new ArrayList<>();
        while (attributes.hasMore()) {
            modItems.add(new ModificationItem(DirContext.REPLACE_ATTRIBUTE, attributes.next()));
        }
        modifyAttributes(dn, modItems.toArray(new ModificationItem[modItems.size()]));
    }

    /** Removes the given attribute for the given DN */
    public void removeAttribute(String dn, Attribute attribute) throws NamingException {
        modifyAttributes(dn, new ModificationItem[]{new ModificationItem(DirContext.REMOVE_ATTRIBUTE, attribute)});
    }

    /** Adds the given attribute for the given DN */
    public void addAttribute(String dn, Attribute attribute) throws NamingException {
        modifyAttributes(dn, new ModificationItem[]{new ModificationItem(DirContext.ADD_ATTRIBUTE, attribute)});
    }

    /** Modifies the attributes of the given DN */
    public void modifyAttributes(String dn, ModificationItem[] mods) throws NamingException {
        try {
            execute(ctx -> {
                ctx.modifyAttributes(dn, mods);
                return null;
            });
            log.debug("Modified attributes for DN " + dn);
        } catch (NamingException e) {
            log.error("Error modifying attributes for DN " + dn);
            throw e;
        }
    }

    /** Creates an LDAP context with the given name */
    public void addEntry(String name, final Attributes attributes) throws NamingException {
        try {
            execute(ctx -> {
                ctx.createSubcontext(name, attributes).close();
                log.debug("Creates LDAP context with name " + name);
                return null;
            });
        } catch (NamingException e) {
            log.error("Error creating LDAP context for name " + name);
            throw e;
        }
    }

    /** Removes the given DN */
    public void removeEntry(String dn) throws NamingException {
        try {
            execute(ctx -> {
                destroyLdapContext(ctx, dn);
                return null;
            });
            log.debug("Removed DN " + dn);
        } catch (NamingException e) {
            log.error("Error removing DN " + dn);
            throw e;
        }
    }

    /** Renames the given DN */
    public void renameEntry(String oldName, String newName) throws NamingException {
        try {
            execute(ctx -> {
                ctx.rename(oldName, newName);
                return null;
            });
            log.debug("Renamed DN " + oldName + " -> " + newName);
        } catch (NamingException e) {
            log.error("Error renaming DN " + oldName + " -> " + newName);
            throw e;
        }
    }

    /** Executes the given LDAP search */
    public List<SearchResult> search(String dn, String filter, Collection<String> attrs, int searchScope) throws NamingException {
        List<SearchResult> result = new ArrayList<>();
        SearchControls cons = getSearchControls(attrs, searchScope);
        final String ldapFilter = (filter == null || filter.length() == 0) ? "(objectClass=*)" : filter;

        try {
            return execute(ctx -> {
                NamingEnumeration<SearchResult> search = ctx.search(dn, ldapFilter, cons);

                while (search.hasMoreElements()) {
                    result.add(search.nextElement());
                }

                search.close();

                return result;
            });
        } catch (NamingException e) {
            log.debug(String.format("Could not perform LDAP search DN [%s] and filter [%s]", dn, filter), e);
            throw e;
        }
    }

    /*******************************/
    /** Utility Methods           **/
    /*******************************/

    /** Returns a single attribute value as a string or byte array, and null if undefined */
    @SuppressWarnings("unchecked")
    public static <T> T getAttributeValue(Attributes attrs, String name) {
        try {
            Attribute attr = attrs.get(name);
            return (T)attr.get();
        } catch (Exception e) {
            return null;
        }
    }

    /** Creates an LDAP attribute with the given name and the given values */
    public static Attribute createAttribute(String name, String... value) {
        Attribute attr = new BasicAttribute(name);
        for (int x = 0; value != null && x < value.length; x++) {
            attr.add(value[x]);
        }
        return attr;
    }

    /** Creates an LDAP attribute with the given name and the given values */
    public static Attribute createBinaryAttribute(String name, byte[]... value) {
        Attribute attr = new BasicAttribute(name);
        for (int x = 0; value != null && x < value.length; x++) {
            attr.add(value[x]);
        }
        return attr;
    }

    /**
     * Returns a new LDAP Context. Must be closed after use
     * @return a new LDAP Context
     */
    private InitialLdapContext createLdapContext() throws NamingException {

        Hashtable<Object, Object> env = new Hashtable<>();
        env.put(Context.PROVIDER_URL, ldapConfig.getConnectionUrl());
        env.put(Context.INITIAL_CONTEXT_FACTORY, ldapConfig.getContextFactory());

        env.put(Context.SECURITY_PRINCIPAL, ldapConfig.getBindDN());
        env.put(Context.SECURITY_CREDENTIALS, ldapConfig.getBindCredential());
        env.put(Context.SECURITY_AUTHENTICATION, "simple");

        if (ldapConfig.getBinaryAttributes() != null) {
            env.put("java.naming.ldap.attributes.binary", ldapConfig.getBinaryAttributes());
        }

        return new InitialLdapContext(env, null);
    }

    /** Destroys the given LDAP context and sub-contexts */
    private void destroyLdapContext(LdapContext ctx, final String dn) throws NamingException {
        NamingEnumeration<Binding> enumeration = null;

        try {
            enumeration = ctx.listBindings(dn);

            while (enumeration.hasMore()) {
                Binding binding = enumeration.next();
                String name = binding.getNameInNamespace();

                destroyLdapContext(ctx, name);
            }

            ctx.unbind(dn);
        } finally {
            try {
                if (enumeration != null) {
                    enumeration.close();
                }
            } catch (Exception ignored) {
            }
        }
    }

    /** Constructs the LDAP search controls */
    private SearchControls getSearchControls(Collection<String> attrs, int searchScope) {
        SearchControls cons = new SearchControls();
        cons.setSearchScope(searchScope);
        cons.setReturningObjFlag(false);
        attrs = getReturningAttributes(attrs);
        cons.setReturningAttributes(attrs.toArray(new String[attrs.size()]));
        return cons;
    }

    /** Adds a couple of mandatory attributes to the attribute set */
    private Set<String> getReturningAttributes(Collection<String> attrs) {
        Set<String> result = new HashSet<>();
        if (attrs != null) {
            result.addAll(attrs);
        }
        result.add(getUuidAttrName());
        result.add("objectClass");
        return result;
    }

    /** Returns if the current vendor is Active Directory or not */
    public boolean isActiveDirectory() {
        return "ad".equalsIgnoreCase(ldapConfig.getVendor());
    }

    /** Returns the DN unique id attribute name */
    public String getUuidAttrName() {
        switch ("" + ldapConfig.getVendor().toLowerCase()) {
            case "rhds":
                return "nsuniqueid";
            case "tivoli":
                return "uniqueidentifier";
            case "edirectory":
                return "guid";
            case "ad":
                return "objectGUID";
            default:
                return "entryUUID";
        }
    }

    /**
     * Executes an LDAP operation and returns the result.
     * Guarantees that LDAP contexts are not leaked.
     *
     * @param operation the LDAP operation to execute
     * @return the result
     * @throws NamingException upon LDAP errors
     */
    private <R> R execute(LdapOperation<R> operation) throws NamingException {
        LdapContext context = null;

        try {
            context = createLdapContext();
            return operation.execute(context);
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException ne) {
                    log.error("Could not close LDAP context.", ne);
                }
            }
        }
    }

    /**
     * Interface that represents a discrete LDAP operation
     */
    private interface LdapOperation<R> {
        R execute(LdapContext context) throws NamingException;
    }

}
