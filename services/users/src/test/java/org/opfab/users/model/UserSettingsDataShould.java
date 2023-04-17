/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

class UserSettingsDataShould {



    @Test
    void patch(){
        UserSettingsData userData = UserSettingsData.builder()
                .login("test-login")
                .description("test-description")
                .locale("fr")
                .playSoundForAlarm(true)
                .playSoundForAction(false)
                .systemNotificationAlarm(true)
                .systemNotificationAction(false)
                //Not setting Compliant and Information to test patch on empty
                .playSoundOnExternalDevice(true)
                .replayEnabled(true)
                .replayInterval(123)
                .processStatesNotNotified("processA", Arrays.asList("state1", "state2"))
                .processStatesNotNotified("processB", Arrays.asList("state3", "state4"))
                .build();
        UserSettingsData patched = userData.patch(UserSettingsData.builder().build().clearProcessesStatesNotNotified());


        patched = userData.patch(UserSettingsData.builder().login("new-login").build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().isEqualTo(userData);

        patched = userData.patch(UserSettingsData.builder().description("patched-description").build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("description").isEqualTo(userData);
        assertThat(patched.getDescription()).isEqualTo("patched-description");

        patched = userData.patch(UserSettingsData.builder().locale("patched-locale").build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("locale").isEqualTo(userData);
        assertThat(patched.getLocale()).isEqualTo("patched-locale");

        patched = userData.patch(UserSettingsData.builder().playSoundForAlarm(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForAlarm").isEqualTo(userData);
        assertThat(patched.getPlaySoundForAlarm()).isFalse();

        patched = userData.patch(UserSettingsData.builder().playSoundForAction(true).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForAction").isEqualTo(userData);
        assertThat(patched.getPlaySoundForAction()).isTrue();

        patched = userData.patch(UserSettingsData.builder().playSoundForCompliant(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForCompliant").isEqualTo(userData);
        assertThat(patched.getPlaySoundForCompliant()).isFalse();

        patched = userData.patch(UserSettingsData.builder().playSoundForInformation(true).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForInformation").isEqualTo(userData);
        assertThat(patched.getPlaySoundForInformation()).isTrue();

        patched = userData.patch(UserSettingsData.builder().systemNotificationAlarm(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationAlarm").isEqualTo(userData);
        assertThat(patched.getSystemNotificationAlarm()).isFalse();

        patched = userData.patch(UserSettingsData.builder().systemNotificationAction(true).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationAction").isEqualTo(userData);
        assertThat(patched.getSystemNotificationAction()).isTrue();

        patched = userData.patch(UserSettingsData.builder().systemNotificationCompliant(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationCompliant").isEqualTo(userData);
        assertThat(patched.getSystemNotificationCompliant()).isFalse();

        patched = userData.patch(UserSettingsData.builder().systemNotificationInformation(true).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationInformation").isEqualTo(userData);
        assertThat(patched.getSystemNotificationInformation()).isTrue();

        patched = userData.patch(UserSettingsData.builder().playSoundOnExternalDevice(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundOnExternalDevice").isEqualTo(userData);
        assertThat(patched.getPlaySoundOnExternalDevice()).isFalse();

        patched = userData.patch(UserSettingsData.builder().replayEnabled(false).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("replayEnabled").isEqualTo(userData);
        assertThat(patched.getReplayEnabled()).isFalse();

        patched = userData.patch(UserSettingsData.builder().replayInterval(456).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("replayInterval").isEqualTo(userData);
        assertThat(patched.getReplayInterval()).isEqualTo(456);

        Map<String, List<String>> newProcessesStatesNotNotified = new HashMap<String, List<String>>();
        newProcessesStatesNotNotified.put("processC", Arrays.asList("state5", "state6"));
        patched = userData.patch(UserSettingsData.builder().processesStatesNotNotified(newProcessesStatesNotNotified).build());
        assertThat(patched).usingRecursiveComparison().ignoringFields("processesStatesNotNotified").isEqualTo(userData);
        assertThat(patched.getProcessesStatesNotNotified()).hasSize(1).contains(entry("processC", Arrays.asList("state5", "state6")));

        List<String> newEntitiesDisconnected = new ArrayList<>(Arrays.asList("ENTITY3_FR", "ENTITY4_FR"));
        patched = userData.patch(UserSettingsData.builder().entitiesDisconnected(newEntitiesDisconnected).build().clearProcessesStatesNotNotified());
        assertThat(patched).usingRecursiveComparison().ignoringFields("entitiesDisconnected").isEqualTo(userData);
        assertThat(patched.getEntitiesDisconnected()).hasSize(2).containsExactly("ENTITY3_FR", "ENTITY4_FR");
    }
}
