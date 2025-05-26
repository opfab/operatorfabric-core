/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties("operatorfabric.security.jwt")
@Component
public class JwtProperties {

    // mandatory claim, default value
    private String loginClaim = "sub";

    // optional claims
    private String givenNameClaim = "given_name";
    private String familyNameClaim = "family_name";
    private String nameClaim = "name";
    private String emailClaim = "email";

    private String entitiesIdClaim = "entitiesId";
    private boolean gettingEntitiesFromToken = false;

    public String getLoginClaim() {
        return loginClaim;
    }

    public String getGivenNameClaim() {
        return givenNameClaim;
    }

    public String getFamilyNameClaim() {
        return familyNameClaim;
    }

    public String getNameClaim() {
        return nameClaim;
    }

    public String getEmailClaim() {
        return emailClaim;
    }

    public String getEntitiesIdClaim() {
        return entitiesIdClaim;
    }

    public boolean isGettingEntitiesFromToken() {
        return gettingEntitiesFromToken;
    }

    /*
     * WARNING the setter is needed because the name of the field in the
     * configuration file are not the same as the field name in the class
     * The name of the field in the configuration file is kebab-case and
     * the name of the field in the class is camelCase.
     * It seems spring make an automatic conversion from kebab-case to camelCase
     * when using setter injection
     * so for example : when using the field login-claim in the configuration file
     * spring will call the setter setLoginClaim in the class JwtProperties
     */
    public void setLoginClaim(String loginClaim) {
        this.loginClaim = loginClaim;
    }

    public void setGivenNameClaim(String givenNameClaim) {
        this.givenNameClaim = givenNameClaim;
    }

    public void setFamilyNameClaim(String familyNameClaim) {
        this.familyNameClaim = familyNameClaim;
    }

    public void setNameClaim(String nameClaim) {
        this.nameClaim = nameClaim;
    }

    public void setEmailClaim(String emailClaim) {
        this.emailClaim = emailClaim;
    }

    public void setEntitiesIdClaim(String entitiesIdClaim) {
        this.entitiesIdClaim = entitiesIdClaim;
    }

    public void setGettingEntitiesFromToken(boolean gettingEntitiesFromToken) {
        this.gettingEntitiesFromToken = gettingEntitiesFromToken;
    }
}
