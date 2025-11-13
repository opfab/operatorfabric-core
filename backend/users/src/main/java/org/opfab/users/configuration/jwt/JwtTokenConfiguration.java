/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.jwt;

import org.opfab.configuration.oauth.jwt.JwtProperties;
import org.opfab.users.configuration.jwt.groups.GroupsProperties;
import org.opfab.users.configuration.jwt.groups.GroupsUtils;
import org.opfab.users.mongo.repositories.MongoUserRepository;
import org.opfab.users.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * See README.md for documentation
 */
@Configuration
@Import({ GroupsProperties.class, GroupsUtils.class, JwtProperties.class })
public class JwtTokenConfiguration {

    private final JwtProperties jwtProperties;
    private final GroupsProperties groupsProperties;
    private final GroupsUtils groupsUtils;

    @Autowired
    public JwtTokenConfiguration(JwtProperties jwtProperties, GroupsProperties groupsProperties,
            GroupsUtils groupsUtils) {
        this.jwtProperties = jwtProperties;
        this.groupsProperties = groupsProperties;
        this.groupsUtils = groupsUtils;
    }

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter(@Autowired MongoUserRepository userRepository,
            @Autowired GroupRepository groupRepository) {
        return new OpfabJwtTokenConverter(
                jwtProperties, groupsProperties, userRepository, groupRepository, groupsUtils);

    }

}
