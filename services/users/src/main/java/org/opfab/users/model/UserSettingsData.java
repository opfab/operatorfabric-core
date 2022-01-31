/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsData implements UserSettings {

    @Id
    private String login;
    private String description;
    private String locale;
    private Boolean playSoundForAlarm;
    private Boolean playSoundForAction;
    private Boolean playSoundForCompliant;
    private Boolean playSoundForInformation;
    private Boolean playSoundOnExternalDevice;
    private Boolean replayEnabled;
    private Integer replayInterval;

    @Singular("processStatesNotNotified")
    private Map<String, List<String>> processesStatesNotNotified;

    public UserSettingsData(UserSettings settings) {
        this.login = settings.getLogin();
        this.description = settings.getDescription();
        this.locale = settings.getLocale();
        this.playSoundForAlarm = settings.getPlaySoundForAlarm();
        this.playSoundForAction = settings.getPlaySoundForAction();
        this.playSoundForCompliant = settings.getPlaySoundForCompliant();
        this.playSoundForInformation = settings.getPlaySoundForInformation();
        this.playSoundOnExternalDevice = settings.getPlaySoundOnExternalDevice();
        this.replayEnabled = settings.getReplayEnabled();
        this.replayInterval = settings.getReplayInterval();

        if (settings.getProcessesStatesNotNotified() != null)
            this.processesStatesNotNotified = new HashMap<>(settings.getProcessesStatesNotNotified());
        else
            this.processesStatesNotNotified = null;
    }


    public UserSettingsData clearProcessesStatesNotNotified(){
        setProcessesStatesNotNotified(null);
        return this;
    }

    /**
     * Create a new patched settings using this as reference and overriding fields from other parameter when field is not
     * null.
     * <br>
     * NB: login cannot be changed
     *
     * @param other
     * @return
     */
    public UserSettingsData patch(UserSettings other) {
        UserSettingsData result = new UserSettingsData();
        result.login = this.login;
        result.description = other.getDescription() != null ? other.getDescription() : this.getDescription();
        result.locale = other.getLocale() != null ? other.getLocale() : this.getLocale();
        result.playSoundForAlarm = other.getPlaySoundForAlarm() != null ? other.getPlaySoundForAlarm() : this.getPlaySoundForAlarm();
        result.playSoundForAction = other.getPlaySoundForAction() != null ? other.getPlaySoundForAction() : this.getPlaySoundForAction();
        result.playSoundForCompliant = other.getPlaySoundForCompliant() != null ? other.getPlaySoundForCompliant() : this.getPlaySoundForCompliant();
        result.playSoundForInformation = other.getPlaySoundForInformation() != null ? other.getPlaySoundForInformation() : this.getPlaySoundForInformation();
        result.playSoundOnExternalDevice = other.getPlaySoundOnExternalDevice() != null ? other.getPlaySoundOnExternalDevice() : this.getPlaySoundOnExternalDevice();
        result.replayEnabled = other.getReplayEnabled() != null ? other.getReplayEnabled() : this.getReplayEnabled();
        result.replayInterval = other.getReplayInterval() != null ? other.getReplayInterval() : this.getReplayInterval();

        if (other.getProcessesStatesNotNotified() != null)
            result.processesStatesNotNotified = new HashMap<>(other.getProcessesStatesNotNotified());
        else if (this.getProcessesStatesNotNotified() != null)
            result.processesStatesNotNotified = new HashMap<>(this.getProcessesStatesNotNotified());
        else
            result.processesStatesNotNotified = null;

        return result;
    }
}
