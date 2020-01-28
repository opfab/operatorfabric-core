/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.model;

import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

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
                .timeFormat("LT")
                .dateFormat("LL")
                .login("test-login")
                .description("test-description")
                .email("test@test.tst")
                .locale("fr")
                .timeZone("Europe/Berlin")
                .build();
        UserSettingsData patched = userData.patch(UserSettingsData.builder().timeFormat("LLT").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"timeFormat");
        assertThat(patched.getTimeFormat()).isEqualTo("LLT");

        patched = userData.patch(UserSettingsData.builder().dateFormat("LLT").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"dateFormat");
        assertThat(patched.getDateFormat()).isEqualTo("LLT");

        patched = userData.patch(UserSettingsData.builder().login("new-login").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData);

        patched = userData.patch(UserSettingsData.builder().description("patched-description").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"description");
        assertThat(patched.getDescription()).isEqualTo("patched-description");

        patched = userData.patch(UserSettingsData.builder().email("patched-email").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"email");
        assertThat(patched.getEmail()).isEqualTo("patched-email");

        patched = userData.patch(UserSettingsData.builder().locale("patched-locale").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"locale");
        assertThat(patched.getLocale()).isEqualTo("patched-locale");

        patched = userData.patch(UserSettingsData.builder().timeZone("patched-zone").build().clearTags());
        assertThat(patched).isEqualToIgnoringGivenFields(userData,"timeZone");
        assertThat(patched.getTimeZone()).isEqualTo("patched-zone");
    }
}
