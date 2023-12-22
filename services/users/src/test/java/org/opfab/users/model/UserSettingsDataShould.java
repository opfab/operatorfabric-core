/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

class UserSettingsDataShould {

    static Stream<Arguments> providePatchCases() {
        Map<String, List<String>> newProcessesStatesNotNotified = new HashMap<>();
        newProcessesStatesNotNotified.put("processC", Arrays.asList("state5", "state6"));

        List<String> newEntitiesDisconnected = new ArrayList<>(Arrays.asList("ENTITY3_FR", "ENTITY4_FR"));

        return Stream.of(
            Arguments.of(UserSettingsData.builder().login("new-login").build(), "description"),
            Arguments.of(UserSettingsData.builder().locale("patched-locale").build(), "locale"),
            Arguments.of(UserSettingsData.builder().playSoundForAlarm(false).build(), "playSoundForAlarm"),
            Arguments.of(UserSettingsData.builder().playSoundForAction(true).build(), "playSoundForAction"),
            Arguments.of(UserSettingsData.builder().playSoundForCompliant(false).build(), "playSoundForCompliant"),
            Arguments.of(UserSettingsData.builder().playSoundForInformation(true).build(), "playSoundForInformation"),
            Arguments.of(UserSettingsData.builder().systemNotificationAlarm(false).build(), "systemNotificationAlarm"),
            Arguments.of(UserSettingsData.builder().systemNotificationAction(true).build(), "systemNotificationAction"),
            Arguments.of(UserSettingsData.builder().systemNotificationCompliant(false).build(), "systemNotificationCompliant"),
            Arguments.of(UserSettingsData.builder().systemNotificationInformation(true).build(), "systemNotificationInformation"),
            Arguments.of(UserSettingsData.builder().playSoundOnExternalDevice(false).build(), "playSoundOnExternalDevice"),
            Arguments.of(UserSettingsData.builder().replayEnabled(false).build(), "replayEnabled"),
            Arguments.of(UserSettingsData.builder().replayInterval(456).build(), "replayInterval"),
            Arguments.of(UserSettingsData.builder().processesStatesNotNotified(newProcessesStatesNotNotified).build(), "processesStatesNotNotified"),
            Arguments.of(UserSettingsData.builder().entitiesDisconnected(newEntitiesDisconnected).build(), "entitiesDisconnected")
        );
    }

    @ParameterizedTest(name = " Patch {1}")
    @MethodSource("providePatchCases")
    void patch(UserSettingsData patchData, String ignoredField) {
        UserSettingsData userData = createUserSettingsData();
        UserSettingsData patched = userData.patch(patchData.clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields(ignoredField).isEqualTo(userData);
    }

    private UserSettingsData createUserSettingsData() {
        return UserSettingsData.builder()
            .login("test-login")
            .locale("fr")
            .playSoundForAlarm(true)
            .playSoundForAction(false)
            .systemNotificationAlarm(true)
            .systemNotificationAction(false)
            .playSoundOnExternalDevice(true)
            .replayEnabled(true)
            .replayInterval(123)
            .processStatesNotNotified("processA", Arrays.asList("state1", "state2"))
            .processStatesNotNotified("processB", Arrays.asList("state3", "state4"))
            .build();
    }
}