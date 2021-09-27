/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

public class UserSettingsDataShould {

    @Test
    public void encapsulateTagSet(){
        UserSettingsData userData = UserSettingsData.builder().defaultTag("test1").defaultTag("test2").build();
        assertThat(userData.getDefaultTags()).containsExactly("test1","test2");
        assertThat(userData.getDefaultTagsSet()).containsExactly("test1","test2");
        assertThat(UserSettingsData.builder().build().getDefaultTags()).isEmpty();
        assertThat(UserSettingsData.builder().build().getDefaultTagsSet()).isEmpty();
        userData = UserSettingsData.builder().build();
        userData.setDefaultTags(Arrays.asList("test5","test6"));
        assertThat(userData.getDefaultTagsSet()).containsExactly("test5","test6");
        assertThat(userData.getDefaultTags()).containsExactly("test5","test6");
    }

    @Test
    public void patch(){
        UserSettingsData userData = UserSettingsData.builder()
                .defaultTag("test1").defaultTag("test2")
                .login("test-login")
                .description("test-description")
                .locale("fr")
                .timeZone("Europe/Berlin")
                .playSoundForAlarm(true)
                .playSoundForAction(false)
                //Not setting Compliant and Information to test patch on empty
                .replayEnabled(true)
                .replayInterval(123)
                .processStatesNotNotified("processA", Arrays.asList("state1", "state2"))
                .processStatesNotNotified("processB", Arrays.asList("state3", "state4"))
                .build();
        UserSettingsData patched = userData.patch(UserSettingsData.builder().build().clearTags().clearProcessesStatesNotNotified());


        patched = userData.patch(UserSettingsData.builder().login("new-login").build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData);

        patched = userData.patch(UserSettingsData.builder().description("patched-description").build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"description");
        assertThat(patched.getDescription()).isEqualTo("patched-description");

        patched = userData.patch(UserSettingsData.builder().locale("patched-locale").build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"locale");
        assertThat(patched.getLocale()).isEqualTo("patched-locale");

        patched = userData.patch(UserSettingsData.builder().timeZone("patched-zone").build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"timeZone");
        assertThat(patched.getTimeZone()).isEqualTo("patched-zone");

        patched = userData.patch(UserSettingsData.builder().playSoundForAlarm(false).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"playSoundForAlarm");
        assertThat(patched.getPlaySoundForAlarm()).isEqualTo(false);

        patched = userData.patch(UserSettingsData.builder().playSoundForAction(true).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"playSoundForAction");
        assertThat(patched.getPlaySoundForAction()).isEqualTo(true);

        patched = userData.patch(UserSettingsData.builder().playSoundForCompliant(false).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"playSoundForCompliant");
        assertThat(patched.getPlaySoundForCompliant()).isEqualTo(false);

        patched = userData.patch(UserSettingsData.builder().playSoundForInformation(true).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"playSoundForInformation");
        assertThat(patched.getPlaySoundForInformation()).isEqualTo(true);

        patched = userData.patch(UserSettingsData.builder().replayEnabled(false).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"replayEnabled");
        assertThat(patched.getReplayEnabled()).isEqualTo(false);

        patched = userData.patch(UserSettingsData.builder().replayInterval(456).build().clearTags().clearProcessesStatesNotNotified());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"replayInterval");
        assertThat(patched.getReplayInterval()).isEqualTo(456);

        Map<String, List<String>> newProcessesStatesNotNotified = new HashMap<String, List<String>>();
        newProcessesStatesNotNotified.put("processC", Arrays.asList("state5", "state6"));
        patched = userData.patch(UserSettingsData.builder().processesStatesNotNotified(newProcessesStatesNotNotified).build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"processesStatesNotNotified");
        assertThat(patched.getProcessesStatesNotNotified()).hasSize(1).contains(entry("processC", Arrays.asList("state5", "state6")));

    }
}
