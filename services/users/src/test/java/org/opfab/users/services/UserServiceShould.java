/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.services;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.application.UnitTestApplication;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRightData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.HashSet;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
class UserServiceShould {

    @Autowired
    UserServiceImp userService;

    @Test
    void testIsEachStateUniqueInPerimeter() {
        PerimeterData p1, p2, p3, p4;
        p1 = PerimeterData.builder().id("PERIMETER1_1").process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE, true)))).build();

        p2 = PerimeterData.builder().id("PERIMETER1_2").process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true),
                                                         new StateRightData("state2", RightsEnum.WRITE, true)))).build();

        p3 = PerimeterData.builder().id("PERIMETER2").process("process2")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE, true),
                                                         new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true)))).build();

        p4 = PerimeterData.builder().id("PERIMETER2").process("process2")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE, true),
                                                         new StateRightData("state2", RightsEnum.RECEIVE, true),
                                                         new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true)))).build();

        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p1)).isTrue();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p2)).isTrue();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p3)).isFalse();
        Assertions.assertThat(userService.isEachStateUniqueInPerimeter(p4)).isFalse();
    }

    @Test
    void checkFormatOfIdField() {
        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfIdField("")).withMessage("Id is required.");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfIdField("a")).withMessage("Id should be minimum 2 characters (id=a).");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfIdField("aé"))
            .withMessage("Id should only contain the following characters: letters, _, - or digits (id=aé).");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfIdField("é"))
            .withMessage("Id should be minimum 2 characters (id=é).Id should only contain the following characters: letters, _, - or digits (id=é).");

        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfIdField("validId"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfIdField("valid_id"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfIdField("valid-id"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfIdField("validId_with-digit_0"));
    }

    @Test
    void checkFormatOfLoginField() {
        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfLoginField("")).withMessage("Mandatory 'login' field is missing.");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfLoginField("a")).withMessage("Login should be minimum 2 characters (login=a).");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfLoginField("aé"))
            .withMessage("Login should only contain the following characters: letters, _, -, . or digits (login=aé).");

        Assertions.assertThatExceptionOfType(ApiErrorException.class).isThrownBy(() ->
                userService.checkFormatOfLoginField("é"))
            .withMessage("Login should be minimum 2 characters (login=é).Login should only contain the following characters: letters, _, -, . or digits (login=é).");

        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfLoginField("validLoginConvertedToLowerCase"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfLoginField("valid_login"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfLoginField("valid-login"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfLoginField("valid.login"));
        Assertions.assertThatNoException().isThrownBy(() -> userService.checkFormatOfLoginField("valid.login_with-digit_0"));
    }
}
