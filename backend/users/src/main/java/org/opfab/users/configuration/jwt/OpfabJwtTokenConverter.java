/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.jwt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.opfab.users.model.Group;
import org.opfab.common.users.PermissionEnum;
import org.opfab.common.users.User;
import org.opfab.configuration.oauth.jwt.JwtProperties;
import org.opfab.configuration.oauth.OpFabJwtAuthenticationToken;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;

import org.opfab.users.mongo.repositories.MongoUserRepository;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.configuration.jwt.groups.GroupsProperties;
import org.opfab.users.configuration.jwt.groups.GroupsUtils;
import org.opfab.users.configuration.jwt.groups.GroupsMode;

/**
 * See README.md for documentation
 */
public class OpfabJwtTokenConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final JwtProperties jwtProperties;
    private final GroupsProperties groupsProperties;
    private final MongoUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupsUtils groupsUtils;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OpfabJwtTokenConverter.class);

    public OpfabJwtTokenConverter(JwtProperties jwtProperties, GroupsProperties groupsProperties,
            MongoUserRepository userRepository, GroupRepository groupRepository, GroupsUtils groupsUtils) {
        this.jwtProperties = jwtProperties;
        this.groupsProperties = groupsProperties;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.groupsUtils = groupsUtils;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        String login = extractAndValidateLogin(jwt);
        if (login == null) {
            return null;
        }

        Optional<User> userInDatabase = userRepository.findById(login);

        // It is possible the user is not present yet in Opfab database
        // in this case we only use information from the token
        // The process to create the user in Opfab is done elsewhere
        User user;
        if (userInDatabase.isEmpty()) {
            log.info("user {} non existent in opfab, use info from jwt token ", login);
            user = createUserFromJwt(login, jwt);
        } else {
            user = userInDatabase.get();
        }

        enrichUserFromJwt(jwt, user);

        List<GrantedAuthority> authorities = computeAuthorities(user);

        log.debug("user [{}] has these roles {} through the {} mode", login, authorities,
                groupsProperties.getMode());

        return new OpFabJwtAuthenticationToken(jwt, user, authorities);
    }

    private String extractAndValidateLogin(Jwt jwt) {
        String login = jwt.getClaimAsString(jwtProperties.getLoginClaim());
        if (login == null || login.trim().isEmpty()) {
            log.error("Token does not contain valid claim {}", jwtProperties.getLoginClaim());
            return null;
        }
        // Normalize login to lowercase as stored in database
        return login.toLowerCase().trim();
    }

    private User createUserFromJwt(String login, Jwt jwt) {

        String givenName = extractClaimAsStringOrNull(jwt, jwtProperties.getGivenNameClaim());
        String familyName = extractClaimAsStringOrNull(jwt, jwtProperties.getFamilyNameClaim());
        String name = extractClaimAsStringOrNull(jwt, jwtProperties.getNameClaim());

        if (givenName == null && familyName == null)
            familyName = name;

        return new User(login, givenName, familyName, null, null, null, null);
    }

    /**
     * Needed to avoid null pointer exception in case claim is null
     */
    private String extractClaimAsStringOrNull(Jwt jwt, String claim) {
        if (claim == null)
            return null;
        return jwt.getClaimAsString(claim);
    }

    private void enrichUserFromJwt(Jwt jwt, User user) {
        if (groupsProperties.getMode() == GroupsMode.JWT) {
            user.setGroups(groupsUtils.createGroupsList(jwt));
        }

        if (jwtProperties.isGettingEntitiesFromToken()) {
            user.setEntities(getEntitiesFromToken(jwt));
        }
        // User email is always taken from the JWT it is not set via the Opfab user
        // administration feature.
        // This may evolve in the future to allow user administration to set the email
        // via the UI.
        String email = extractClaimAsStringOrNull(jwt, jwtProperties.getEmailClaim());
        if (email != null) {
            user.setEmail(email);
        }

        if (jwtProperties.isGettingFirstAndLastNameFromToken()) {
            user.setFirstName(extractClaimAsStringOrNull(jwt, jwtProperties.getGivenNameClaim()));
            user.setLastName(extractClaimAsStringOrNull(jwt, jwtProperties.getFamilyNameClaim()));
        }
    }

    private List<String> getEntitiesFromToken(Jwt jwt) {
        // Legacy mode: entitiesIdClaim is a single string
        // with entities IDs separated by semicolon
        if (jwtProperties.isEntitiesIdClaimSingleString()) {
            String entitiesId = jwt.getClaimAsString(jwtProperties.getEntitiesIdClaim());
            List<String> enititiesIdList = new ArrayList<>();
            if (entitiesId != null)
                enititiesIdList.addAll(Arrays.asList(entitiesId.split(";")));
            return enititiesIdList;
        }

        List<String> entitiesIdClaim = jwt.getClaimAsStringList(jwtProperties.getEntitiesIdClaim());
        if (entitiesIdClaim == null)
            return new ArrayList<>();
        else
            return entitiesIdClaim;
    }

    private List<GrantedAuthority> computeAuthorities(User user) {
        Set<PermissionEnum> permissionsData = collectPermissionsFromGroups(user);

        List<GrantedAuthority> authorities = new ArrayList<>();

        if (permissionsData.contains(PermissionEnum.ADMIN)) {
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN"));
        }
        if (permissionsData.contains(PermissionEnum.ADMIN_BUSINESS_PROCESS)) {
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN_BUSINESS_PROCESS"));
        }
        if (permissionsData.contains(PermissionEnum.VIEW_USER_ACTION_LOGS)) {
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_VIEW_USER_ACTION_LOGS"));
        }
        return authorities;
    }

    private Set<PermissionEnum> collectPermissionsFromGroups(User user) {
        Set<PermissionEnum> permissionsData = new HashSet<>();
        List<String> userGroups = user.getGroups();
        if (userGroups == null || userGroups.isEmpty()) {
            return permissionsData;
        }
        userGroups.forEach(groupId -> {
            // No overhead here as groups are cached in CachedGroupRepositoryImpl
            Optional<Group> group = groupRepository.findById(groupId);
            group.ifPresent(g -> permissionsData.addAll(g.getPermissions()));
        });
        return permissionsData;
    }

}
