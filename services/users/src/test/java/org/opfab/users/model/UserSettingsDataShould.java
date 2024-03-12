/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class UserSettingsDataShould {

    @Test
    void ShouldPatchLocale() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setLocale("new-locale");
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("locale").isEqualTo(userData);
        assertThat(patched.getLocale()).isEqualTo("new-locale");
    }

    @Test
    void ShouldPatchPlaySoundForAlarm() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setPlaySoundForAlarm(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForAlarm").isEqualTo(userData);
        assertThat(patched.getPlaySoundForAlarm()).isFalse();
    }

    @Test
    void ShouldPatchPlaySoundForAction() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setPlaySoundForAction(true);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForAction").isEqualTo(userData);
        assertThat(patched.getPlaySoundForAction()).isTrue();
    }

    @Test
    void ShouldPatchPlaySoundForCompliant() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setPlaySoundForCompliant(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForCompliant").isEqualTo(userData);
        assertThat(patched.getPlaySoundForCompliant()).isFalse();
    }

    @Test
    void ShouldPatchPlaySoundForInformation() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setPlaySoundForInformation(true);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundForInformation").isEqualTo(userData);
        assertThat(patched.getPlaySoundForInformation()).isTrue();
    }

    @Test
    void ShouldPatchSystemNotificationAlarm() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setSystemNotificationAlarm(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationAlarm").isEqualTo(userData);
        assertThat(patched.getSystemNotificationAlarm()).isFalse();
    }   

    @Test
    void ShouldPatchSystemNotificationAction() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setSystemNotificationAction(true);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationAction").isEqualTo(userData);
        assertThat(patched.getSystemNotificationAction()).isTrue();
    }

    @Test
    void ShouldPatchSystemNotificationCompliant() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setSystemNotificationCompliant(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationCompliant").isEqualTo(userData);
        assertThat(patched.getSystemNotificationCompliant()).isFalse();
    }

    @Test
    void ShouldPatchSystemNotificationInformation() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setSystemNotificationInformation(true);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("systemNotificationInformation").isEqualTo(userData);
        assertThat(patched.getSystemNotificationInformation()).isTrue();
    }

    @Test
    void ShouldPatchPlaySoundOnExternalDevice() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setPlaySoundOnExternalDevice(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("playSoundOnExternalDevice").isEqualTo(userData);
        assertThat(patched.getPlaySoundOnExternalDevice()).isFalse();
    }

    @Test
    void ShouldPatchReplayEnabled() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setReplayEnabled(false);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("replayEnabled").isEqualTo(userData);
        assertThat(patched.getReplayEnabled()).isFalse();
    }

    @Test
    void ShouldPatchReplayInterval() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        patch.setReplayInterval(456);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("replayInterval").isEqualTo(userData);
        assertThat(patched.getReplayInterval()).isEqualTo(456);
    }

    @Test
    void ShouldPatchProcessesStatesNotNotified() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        Map<String, List<String>> newProcessesStatesNotNotified = new HashMap<>();
        newProcessesStatesNotNotified.put("processC", Arrays.asList("state5", "state6"));
        patch.setProcessesStatesNotNotified(newProcessesStatesNotNotified);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("processesStatesNotNotified").isEqualTo(userData);
        assertThat(patched.getProcessesStatesNotNotified()).isEqualTo(newProcessesStatesNotNotified);
    }

    @Test
    void ShouldPatchEntitiesDisconnected() {
        UserSettings userData = createUserSettingsData();
        UserSettings patch = new UserSettings();
        List<String> newEntitiesDisconnected = new ArrayList<>(Arrays.asList("ENTITY3_FR", "ENTITY4_FR"));
        patch.setEntitiesDisconnected(newEntitiesDisconnected);
        UserSettings patched = userData.patch(patch);
        assertThat(patched).usingRecursiveComparison().ignoringFields("entitiesDisconnected").isEqualTo(userData);
        assertThat(patched.getEntitiesDisconnected()).isEqualTo(newEntitiesDisconnected);
    }


    private UserSettings createUserSettingsData() {
        UserSettings userSettingsData = new UserSettings();
        userSettingsData.setLogin("test-login");
        userSettingsData.setLocale("fr");
        userSettingsData.setPlaySoundForAlarm(true);
        userSettingsData.setPlaySoundForAction(false);
        userSettingsData.setSystemNotificationAlarm(true);
        userSettingsData.setSystemNotificationAction(false);
        userSettingsData.setPlaySoundOnExternalDevice(true);
        userSettingsData.setReplayEnabled(true);
        userSettingsData.setReplayInterval(123);

        Map<String, List<String>> processesStatesNotNotified = new HashMap<>();
        processesStatesNotNotified.put("processA", Arrays.asList("state1", "state2"));
        processesStatesNotNotified.put("processB", Arrays.asList("state3", "state4"));
        userSettingsData.setProcessesStatesNotNotified(null);
        return userSettingsData;
    }
}