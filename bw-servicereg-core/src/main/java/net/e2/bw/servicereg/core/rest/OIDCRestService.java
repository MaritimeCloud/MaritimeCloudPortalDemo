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
package net.e2.bw.servicereg.core.rest;

import net.e2.bw.idreg.client.AccessTokenData;
import net.e2.bw.idreg.client.AuthErrorException;
import net.e2.bw.idreg.client.OIDCClient;
import net.e2.bw.servicereg.core.Roles;
import net.e2.bw.servicereg.core.Roles.ServiceRole;
import net.e2.bw.servicereg.model.AuthorizedUser;
import net.e2.bw.servicereg.core.service.UserService;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.io.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Interface for OpenID Connect authentication
 */
@Singleton
@Startup
@Lock(LockType.READ)
@Path("/auth")
@SuppressWarnings("unused")
public class OIDCRestService extends AbstractRestService {

    private static final String HEADER_ORIGINAL_SCHEME = "originalScheme";

    private OIDCClient oidcClient;

    @Inject
    @SuppressWarnings("CdiInjectionPointsInspection")
    UserService userService;

    @Inject
    Logger log;

    @Context
    HttpServletResponse response;

    /**
     * Called when the service is initialized
     */
    @PostConstruct
    @Lock(LockType.WRITE)
    public void init() {

        try {
             String filePath = System.getProperty("keycloak.json");

            // Use keycloak.json defined by system property. Otherwise, use keycloak.json in classpath
            InputStream keycloakConfigFile = (filePath != null)
                    ? new FileInputStream(new File(filePath))
                    : OIDCRestService.class.getResourceAsStream("/keycloak.json");

            try (Reader configFile = new InputStreamReader(keycloakConfigFile)) {
                oidcClient = OIDCClient.newBuilder()
                        .configuration(configFile)
                        .customClaims("mmsi")
                        .build();
            }

        } catch (Exception e) {
            log.error("Error initializing the OpenID Connect service", e);

            // Prevent the webapp from launching
            throw new RuntimeException(e);
        }
    }


    @GET
    @Path("/current-subject")
    @Produces(MediaType.APPLICATION_JSON)
    @NoCache
    public AuthorizedUser currentSubject() {
        return getSubject();
    }

    /**
     * Called in order to authenticate via OpenID Connect.
     */
    @GET
    @Path("/oidc-login")
    @NoCache
    public void oidcLogin() throws IOException {

        String tagetUrl = request.getParameter("targetUrl");
        if (tagetUrl != null) {
            request.getSession(true).setAttribute("targetUrl", tagetUrl);
        }

        log.info("OpenID Connect login called");
        String callbackUrl = getUrl(request, "/rest/auth/oidc-callback");
        oidcClient.redirectToAuthServer(response, callbackUrl);
    }

    /**
     * The callback endpoint called by the OpenID Connect service.
     */
    @GET
    @Path("/oidc-callback")
    @NoCache
    public void oidcCallback() throws IOException {
        String targetUrl = null;

        if (request.getSession() != null) {
            targetUrl = (String)request.getSession().getAttribute("targetUrl");
            request.getSession().invalidate();
        }

        log.info("OpenID Connect callback called");
        try {
            String callbackUrl = getUrl(request, "/rest/auth/oidc-callback");
            AccessTokenData accessTokenData = oidcClient.handleAuthServerCallback(request, callbackUrl);
            log.info("OpenID Connect authentication success: " + accessTokenData);

            AuthorizedUser subject = new AuthorizedUser();
            userService.getUser(accessTokenData.getUserName()).copyTo(subject);

            Set<String> roles = accessTokenData.getResourceRoles() != null
                    ? accessTokenData.getResourceRoles()
                    : accessTokenData.getRealmRoles();

            if (roles == null) {
                roles = new HashSet<>();
            }
            if (!roles.contains(ServiceRole.user.name())) {
                roles.add(ServiceRole.user.name());
            }
            subject.setSiteRoles(roles.stream().toArray(String[]::new));


            request.getSession(true).setAttribute(SUBJECT_ATTR, subject);

        } catch (AuthErrorException e) {
            log.error("OpenID Connect authentication error", e);
            request.getSession(true).setAttribute("error", e.getMessage());
        }

        response.sendRedirect(targetUrl == null ? "/" : targetUrl);
    }

    /**
     * Invalidates the user http session.
     */
    @GET
    @Path("/logout")
    @NoCache
    public void logout() throws IOException {
        if (request.getSession() != null) {
            request.getSession().invalidate();
        }
        response.sendRedirect("/");
    }


    /**
     * Logs the user out and redirects to the auth server to log out the session there
     */
    @GET
    @Path("/auth-server-logout")
    @NoCache
    public void logoutAuthServer() throws IOException {
        if (request.getSession() != null) {
            request.getSession().invalidate();
        }

        String callbackUrl = getUrl(request);
        oidcClient.redirectToAuthServerLogout(response, callbackUrl);
    }

    /**
     * Redirects to the edit-account page for the current user
     */
    @GET
    @Path("/auth-server-account")
    @NoCache
    public void editAccount() throws IOException {
        oidcClient.redirectToAuthServerAccount(response);
    }

    /**
     * Returns the base URL of the request
     * <p/>
     * When running HTTPS behind, say, an Apache web server which handles the SSL decoding,
     * then request.getScheme() may still return "http".
     * <p/>
     * If, however, the port-443 VirtualHost is configured to set the header originalScheme=https,
     * then function will ensure that https is used in relative redirects.
     *
     * <p>Example configuration:</p>
     * <pre>
     *     Header add originalScheme "https"
     *     RequestHeader set originalScheme "https"
     * </pre>
     *
     * @param request the request
     * @param appends list of URI components to append
     * @return the base URL + optional appends
     */
    private String getUrl(HttpServletRequest request, String... appends) {
        String scheme = request.getScheme();

        if ("https".equalsIgnoreCase(request.getHeader(HEADER_ORIGINAL_SCHEME))) {
            scheme = "https";
        }

        String result = String.format(
                "%s://%s%s%s",
                scheme,
                request.getServerName(),
                request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort(),
                request.getContextPath());
        for (String a : appends) {
            result = result + a;
        }
        return result;
    }

}
