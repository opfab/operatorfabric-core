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

class IdFormatCheckerShould {

    @Test
    void GIVEN_An_Id_With_No_Characters_WHEN_Id_Checked_THEN_Id_Is_Invalid() {
        assertThat(IdFormatChecker.check("").isValid()).isFalse();
        assertThat(IdFormatChecker.check("").getErrorMessage()).isEqualTo("Id is required.");
    }

    @Test
    void GIVEN_An_Id_With_One_Characters_WHEN_Id_Checked_THEN_Id_Is_Invalid() {
        assertThat(IdFormatChecker.check("a").isValid()).isFalse();
        assertThat(IdFormatChecker.check("a").getErrorMessage()).isEqualTo("Id should be minimum 2 characters (id=a).");
    }

    @Test
    void GIVEN_An_Id_With_An_Accent_WHEN_Id_Checked_THEN_Id_Is_Invalid() {
        assertThat(IdFormatChecker.check("aà").isValid()).isFalse();
        assertThat(IdFormatChecker.check("aà").getErrorMessage()).isEqualTo("Id should only contain the following characters: letters, _, - or digits (id=aà).");
    }

    @Test
    void GIVEN_An_Id_With_A_Dot_WHEN_Id_Checked_THEN_Id_Is_Invalid() {
        assertThat(IdFormatChecker.check("login.").isValid()).isFalse();
        assertThat(IdFormatChecker.check("login.").getErrorMessage()).isEqualTo("Id should only contain the following characters: letters, _, - or digits (id=login.).");
    }

    @Test
    void GIVEN_An_Id_With_Only_Letters_WHEN_Id_Checked_THEN_Id_Is_Valid() {
        assertThat(IdFormatChecker.check("validID").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Id_With_An_Underscore_WHEN_Id_Checked_THEN_Id_Is_Valid() {
        assertThat(IdFormatChecker.check("letters_").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Id_With_A_Minus_WHEN_Id_Checked_THEN_Id_Is_Valid() {
        assertThat(IdFormatChecker.check("letters-").isValid()).isTrue();
    }

    @Test
    void GIVEN_An_Id_With_Digits_WHEN_Id_Checked_THEN_Id_Is_Valid() {
        assertThat(IdFormatChecker.check("letters09233").isValid()).isTrue();
    }

    
}
