/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.configuration;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.publication.configuration.oauth2.WebSecurityConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * WebSecurity test configuration
 * The following changes to the main WebSecurityConfiguration are necessary for tests
 *  - Disable csrf
 *  - Remove configuration of OAuth2ResourceServer
 *
 *
 */
@Configuration
@Slf4j
public class WebSecurityConfigurationTest extends WebSecurityConfigurerAdapter  {

    @Value("${checkAuthenticationForCardSending:true}")
    private boolean checkAuthenticationForCardSending;
    
    @Override
    public void configure(final HttpSecurity http) throws Exception {
        WebSecurityConfiguration.configureCommon(http, checkAuthenticationForCardSending);
        http.csrf().disable();
    }

}
