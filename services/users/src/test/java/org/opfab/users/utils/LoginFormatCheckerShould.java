/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LoginFormatCheckerShould {

    @Test
    void GIVEN_An_Login_With_No_Characters_WHEN_Login_Checked_THEN_Login_Is_Invalid() {
        assertThat(LoginFormatChecker.check("").isValid()).isFalse();
        assertThat(LoginFormatChecker.check("").getErrorMessage()).isEqualTo("Mandatory 'login' field is missing.");
    }

    @Test
    void GIVEN_An_Login_With_One_Characters_WHEN_Login_Checked_THEN_Login_Is_Invalid() {
        assertThat(LoginFormatChecker.check("a").isValid()).isFalse();
        assertThat(LoginFormatChecker.check("a").getErrorMessage()).isEqualTo("Login should be minimum 2 characters (login=a).");
    }

    @Test
    void GIVEN_An_Login_With_An_Accent_WHEN_Login_Checked_THEN_Login_Is_Invalid() {
        assertThat(LoginFormatChecker.check("aà").isValid()).isFalse();
        assertThat(LoginFormatChecker.check("aà").getErrorMessage()).isEqualTo("Login should only contain the following characters: letters, _, -, . or digits (login=aà).");
    }

    @Test
    void GIVEN_An_Login_With_A_Dot_WHEN_Login_Checked_THEN_Login_Valid() {
        assertThat(LoginFormatChecker.check("login.").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Login_With_Only_Letters_WHEN_Login_Checked_THEN_Login_Is_Valid() {
        assertThat(LoginFormatChecker.check("validLOGIN").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Login_With_An_Underscore_WHEN_Login_Checked_THEN_Login_Is_Valid() {
        assertThat(LoginFormatChecker.check("login_").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Login_With_A_Minus_WHEN_Login_Checked_THEN_Login_Is_Valid() {
        assertThat(LoginFormatChecker.check("login-").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Login_With_Digits_WHEN_Login_Checked_THEN_Login_Is_Valid() {
        assertThat(LoginFormatChecker.check("login09233").isValid()).isTrue();
    }

    
}
