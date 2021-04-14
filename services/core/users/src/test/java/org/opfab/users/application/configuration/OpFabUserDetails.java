/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.application.configuration;

import lombok.AllArgsConstructor;
import org.opfab.users.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * This class implements the OperatorFabric custom {@link User} and implements Spring Security's {@link UserDetails} to serve as a mock in tests (see {@link WithMockOpFabUser})
 * The behaviour is similar to the OpFabUserDetails class defined in the tools/spring/spring-test-utilities module used by the other services, which extends the User class from the client-data module.
 * This clashed with the User interface already present in the users-business-service module (same qualified name), so a separate class had to be created for the Users service, this time implementing the User interface.
 *
 *
 */
@AllArgsConstructor
public class OpFabUserDetails implements UserDetails, User {

    private String login = null;
    private String firstName = null;
    private String lastName = null;
    private List<String> groups = null;
    private List<String> entities = null;

    /**
     * Creates Authority list from user's groups (ROLE_[group name])
     * Similar to the method of the same name defined in OAuth2JwtProcessingUtilities,
     * but using the User interface from the users-business-service module rather than the User class from client-data.
     * @param user user model data
     * @return list of authority
     */
    private static List<GrantedAuthority> computeAuthorities(User user) {
        return AuthorityUtils.createAuthorityList(user.getGroups().stream().map(g -> "ROLE_" + g).toArray(size ->
                new
                        String[size]));
    }

    //Methods from the UserDetails interface

    /**
     * Returns the authorities granted to the user. Cannot return <code>null</code>.
     *
     * @return the authorities, sorted by natural key (never <code>null</code>)
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return computeAuthorities(this);
    }

    /**
     * Returns the password used to authenticate the user.
     *
     * @return the password
     */
    @Override
    public String getPassword() {
        return null;
    }

    /**
     * Returns the login used to authenticate the user. Cannot return <code>null</code>.
     *
     * @return the login (never <code>null</code>)
     */
    @Override
    public String getUsername() {
        return null;
    }

    /**
     * Indicates whether the user's account has expired. An expired account cannot be
     * authenticated.
     *
     * @return <code>true</code> if the user's account is valid (ie non-expired),
     * <code>false</code> if no longer valid (ie expired)
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked. A locked user cannot be
     * authenticated.
     *
     * @return <code>true</code> if the user is not locked, <code>false</code> otherwise
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the user's credentials (password) has expired. Expired
     * credentials prevent authentication.
     *
     * @return <code>true</code> if the user's credentials are valid (ie non-expired),
     * <code>false</code> if no longer valid (ie expired)
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled. A disabled user cannot be
     * authenticated.
     *
     * @return <code>true</code> if the user is enabled, <code>false</code> otherwise
     */
    @Override
    public boolean isEnabled() {
        return true;
    }

    //Methods from the User interface

    @Override
    public String getLogin() {
        return login;
    }

    @Override
    public void setLogin(String login) {
        this.login = login;
    }

    @Override
    public String getFirstName() {
        return firstName;
    }

    @Override
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @Override
    public String getLastName() {
        return lastName;
    }

    @Override
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @Override
    public List<String> getGroups() {
        return groups;
    }

    @Override
    public void setGroups(List<String> groups) {
        this.groups = groups;
    }

    @Override
    public List<String> getEntities() {
        return entities;
    }

    @Override
    public void setEntities(List<String> entities) {
        this.entities = entities;
    }
}
