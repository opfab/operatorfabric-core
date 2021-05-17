/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.test;

import org.opfab.springtools.configuration.oauth.OAuth2JwtProcessingUtilities;
import org.opfab.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

import lombok.Data;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletInputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpUpgradeHandler;
import javax.servlet.AsyncContext;
import javax.servlet.DispatcherType;
import javax.servlet.http.Part;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
/**
 * Creates {@link SecurityContext} containing token holding {@link WithMockOpFabUser} principal
 *
 *
 */
public class WithMockOpFabUserSecurityContextFactory implements WithSecurityContextFactory<WithMockOpFabUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockOpFabUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        OpFabUserDetails principal = new OpFabUserDetails(
                        customUser.login(),
                        customUser.firstName(),
                        customUser.lastName(),
                Arrays.asList(customUser.roles()),
                customUser.entities() != null ? Arrays.asList(customUser.entities()) : null,
                customUser.authorizedIPAddresses() != null ? Arrays.asList(customUser.authorizedIPAddresses()) : null);

        String tokenValue = "dummyTokenValue";
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plus(365, ChronoUnit.DAYS);
        Map<String, Object> headers = new HashMap<>();
        headers.put("dummyHeaderKey","dummyHeaderValue");
        Map<String, Object> claim = new HashMap<>();
        claim.put("sub",customUser.login());
        Collection<GrantedAuthority> authorities = OAuth2JwtProcessingUtilities.computeAuthorities(principal.getUserData());

        Authentication auth = new MockAuthenticationWithDetails( 
                new Jwt(tokenValue, issuedAt,expiresAt,headers,claim
                ),principal,authorities);


        context.setAuthentication(auth);

        return context;
    }

    private class MockAuthenticationWithDetails extends OpFabJwtAuthenticationToken {

        MockAuthenticationWithDetails(Jwt token, OpFabUserDetails principal, Collection<GrantedAuthority> authorities) {
            super(token, principal,authorities);
        }

        @Override
        public Object getDetails() {
            return new MockWebAuthenticationDetails(new MockHttpservletRequest());
        }

    }

    class MockWebAuthenticationDetails extends WebAuthenticationDetails {

        MockWebAuthenticationDetails(HttpServletRequest req) {
            super(req);
        }

        
        @Override
        public String getRemoteAddress() {
            return "127.0.0.1";
        }


    }
    @Data
    class MockHttpservletRequest implements HttpServletRequest {

        @Override
        public <T extends HttpUpgradeHandler> T upgrade(Class<T> handlerClass) throws IOException, ServletException {
            return null;
        }

        @Override
        public Object getAttribute(String name) {
            return null;
        }

        @Override
        public Enumeration getAttributeNames() {
            return null;
        }

        @Override
        public String getCharacterEncoding() {
            return null;
        }

        @Override
        public void setCharacterEncoding(String env) throws UnsupportedEncodingException {
        }

        @Override
        public int getContentLength() {
            return 0;
        }

        @Override
        public String getContentType() {
            return null;
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            return null;
        }

        @Override
        public String getParameter(String name) {
            return null;
        }

        @Override
        public Enumeration getParameterNames() {
            return null;
        }

        @Override
        public String[] getParameterValues(String name) {
            return null;
        }

        @Override
        public Map getParameterMap() {
            return null;
        }

        @Override
        public String getProtocol() {
            return null;
        }

        @Override
        public String getScheme() {
            return null;
        }

        @Override
        public String getServerName() {
            return null;
        }

        @Override
        public int getServerPort() {
            return 0;
        }

        @Override
        public BufferedReader getReader() throws IOException {
            return null;
        }

        @Override
        public String getRemoteAddr() {
            return null;
        }

        @Override
        public String getRemoteHost() {
            return null;
        }

        @Override
        public void setAttribute(String name, Object o) {
        }

        @Override
        public void removeAttribute(String name) {
        }

        @Override
        public Locale getLocale() {
            return null;
        }

        @Override
        public Enumeration getLocales() {
            return null;
        }

        @Override
        public boolean isSecure() {
            return false;
        }

        @Override
        public RequestDispatcher getRequestDispatcher(String path) {
            return null;
        }

        @Override
        public String getRealPath(String path) {
            return null;
        }

        @Override
        public int getRemotePort() {
            return 0;
        }

        @Override
        public String getLocalName() {
            return null;
        }

        @Override
        public String getLocalAddr() {
            return null;
        }

        @Override
        public int getLocalPort() {
            return 0;
        }

        @Override
        public String getAuthType() {
            return null;
        }

        @Override
        public Cookie[] getCookies() {
            return null;
        }

        @Override
        public long getDateHeader(String name) {
            return 0;
        }

        @Override
        public String getHeader(String name) {
            return null;
        }

        @Override
        public Enumeration getHeaders(String name) {
            return null;
        }

        @Override
        public Enumeration getHeaderNames() {
            return null;
        }

        @Override
        public int getIntHeader(String name) {
            return 0;
        }

        @Override
        public String getMethod() {
            return null;
        }

        @Override
        public String getPathInfo() {
            return null;
        }

        @Override
        public String getPathTranslated() {
            return null;
        }

        @Override
        public String getContextPath() {
            return null;
        }

        @Override
        public String getQueryString() {
            return null;
        }

        @Override
        public String getRemoteUser() {
            return null;
        }

        @Override
        public boolean isUserInRole(String role) {
            return false;
        }

        @Override
        public Principal getUserPrincipal() {
            return null;
        }

        @Override
        public String getRequestedSessionId() {
            return null;
        }

        @Override
        public String getRequestURI() {
            return null;
        }

        @Override
        public StringBuffer getRequestURL() {
            return null;
        }

        @Override
        public String getServletPath() {
            return null;
        }

        @Override
        public HttpSession getSession(boolean create) {
            return null;
        }

        @Override
        public HttpSession getSession() {
            return null;
        }

        @Override
        public boolean isRequestedSessionIdValid() {
            return false;
        }

        @Override
        public boolean isRequestedSessionIdFromCookie() {
            return false;
        }

        @Override
        public boolean isRequestedSessionIdFromURL() {
            return false;
        }

        @Override
        public boolean isRequestedSessionIdFromUrl() {
            return false;
        }

        @Override
        public Part getPart(String name) {
            return null;
        }

        @Override
        public Collection<Part> getParts() {
            return null;
        }

        @Override
        public void logout() {
        }

        @Override
        public void login(String user, String password) {
        }

        @Override
        public boolean authenticate(HttpServletResponse response) {
            return false;
        }

        @Override
        public String changeSessionId() {
            return null;
        }

        @Override
        public DispatcherType getDispatcherType() {
            return null;
        }

        @Override
        public AsyncContext getAsyncContext() {
            return null;
        }

        @Override
        public boolean isAsyncSupported() {
            return false;
        }

        @Override
        public boolean isAsyncStarted() {
            return false;
        }

        @Override
        public AsyncContext startAsync() {
            return null;
        }

        @Override
        public AsyncContext startAsync(ServletRequest servletRequest, ServletResponse servletResponse) throws IllegalStateException {
            return null;
        }

        @Override
        public ServletContext getServletContext() {
            return null;
        }

        @Override
        public long getContentLengthLong() {
            return 0;
        }
    }
}
