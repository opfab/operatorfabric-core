/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import org.opfab.users.model.PermissionEnum;
import org.opfab.users.model.User;
import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
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
        String principalId = jwt.getClaimAsString(jwtProperties.getLoginClaim()).toLowerCase();

        Optional<User> optionalUser = userRepository.findById(principalId);

        User user = optionalUser.orElseGet(() -> {
            User virtualUser = createUserDataVirtualFromJwt(jwt);
            log.warn("user virtual(nonexistent in opfab) : '{}'",
                    virtualUser != null ? virtualUser.toString() : "null");
            return virtualUser;
        });
        if (groupsProperties.getMode() == GroupsMode.JWT) {
            // override the groups list from JWT mode, otherwise the default mode is
            // OPERATOR_FABRIC
            user.setGroups(getGroupsList(jwt));
        }

        if (jwtProperties.isGettingEntitiesFromToken() && user != null) {
            user.setEntities(getEntitiesFromToken(jwt));
        }
        // User email is always taken from the JWT; it is not set via the Opfab user
        // administration feature.
        // This may evolve in the future to allow user administration to set the email
        // via the UI.
        String email = extractClaimAsStringOrNull(jwt, jwtProperties.getEmailClaim());
        if (email != null && user != null) {
            user.setEmail(email);
        }

        if (jwtProperties.isGettingFirstAndLastNameFromToken() && user != null) {
            user.setFirstName(extractClaimAsStringOrNull(jwt, jwtProperties.getGivenNameClaim()));
            user.setLastName(extractClaimAsStringOrNull(jwt, jwtProperties.getFamilyNameClaim()));
        }

        List<GrantedAuthority> authorities = computeAuthorities(user);

        log.debug("user [{}] has these roles {} through the {} mode", principalId, authorities,
                groupsProperties.getMode());

        return new OpFabJwtAuthenticationToken(jwt, user, authorities);
    }

    /**
     * create a temporal User from the jwt information without any group
     * 
     * @param jwt jwt
     * @return UserData
     */
    private User createUserDataVirtualFromJwt(Jwt jwt) {
        String principalId = extractClaimAsStringOrNull(jwt, jwtProperties.getLoginClaim());

        if (principalId == null)
            return null;

        principalId = principalId.toLowerCase();

        String givenName = extractClaimAsStringOrNull(jwt, jwtProperties.getGivenNameClaim());
        String familyName = extractClaimAsStringOrNull(jwt, jwtProperties.getFamilyNameClaim());
        String name = extractClaimAsStringOrNull(jwt, jwtProperties.getNameClaim());

        if (givenName == null && familyName == null)
            familyName = name;

        return new User(principalId, givenName, familyName, null, null, null, null);
    }

    /**
     * Creates Authority list from user's groups, taking into account only admin
     * role (ROLE_ADMIN)
     *
     * @param user user model data
     * @return list of authority
     */
    private List<GrantedAuthority> computeAuthorities(User user) {
        Set<PermissionEnum> permissionsData = new HashSet<>();
        user.getGroups().forEach(groupId -> {
            Optional<Group> group = groupRepository.findById(groupId);
            group.ifPresent(g -> permissionsData.addAll(g.getPermissions()));
        });

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (permissionsData.contains(PermissionEnum.ADMIN))
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN"));
        if (permissionsData.contains(PermissionEnum.ADMIN_BUSINESS_PROCESS))
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_ADMIN_BUSINESS_PROCESS"));
        if (permissionsData.contains(PermissionEnum.VIEW_USER_ACTION_LOGS))
            authorities.addAll(AuthorityUtils.createAuthorityList("ROLE_VIEW_USER_ACTION_LOGS"));

        return authorities;
    }

    /**
     * needed otherwise raised geClaimAsString an NPE
     */
    private String extractClaimAsStringOrNull(Jwt jwt, String claim) {
        if (claim == null)
            return null;
        return jwt.getClaimAsString(claim);
    }

    /**
     * Creates group list from a jwt
     *
     * @param jwt user's token
     * @return a group list
     */
    public List<String> getGroupsList(Jwt jwt) {
        return groupsUtils.createGroupsList(jwt);
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
}
