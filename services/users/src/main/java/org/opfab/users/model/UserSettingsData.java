/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import java.util.*;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import  org.opfab.utilities.ObjectUtils;

@Document(collection = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
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
    private Boolean systemNotificationAlarm;
    private Boolean systemNotificationAction;
    private Boolean systemNotificationCompliant;
    private Boolean systemNotificationInformation;
    private Boolean replayEnabled;
    private Integer replayInterval;
    private Boolean remoteLoggingEnabled;
    private Boolean sendCardsByEmail;
    private String email;

    @Singular("processStatesNotNotified")
    private Map<String, List<String>> processesStatesNotNotified;
    @Singular("entityDisconnected")
    private List<String> entitiesDisconnected;

    public UserSettingsData(UserSettings settings) {
        this.login = settings.getLogin();
        this.description = settings.getDescription();
        this.locale = settings.getLocale();
        this.playSoundForAlarm = settings.getPlaySoundForAlarm();
        this.playSoundForAction = settings.getPlaySoundForAction();
        this.playSoundForCompliant = settings.getPlaySoundForCompliant();
        this.playSoundForInformation = settings.getPlaySoundForInformation();
        this.playSoundOnExternalDevice = settings.getPlaySoundOnExternalDevice();
        this.systemNotificationAlarm = settings.getSystemNotificationAlarm();
        this.systemNotificationAction = settings.getSystemNotificationAction();
        this.systemNotificationCompliant = settings.getSystemNotificationCompliant();
        this.systemNotificationInformation = settings.getSystemNotificationInformation();
        this.replayEnabled = settings.getReplayEnabled();
        this.replayInterval = settings.getReplayInterval();
        this.remoteLoggingEnabled = settings.getRemoteLoggingEnabled();
        this.sendCardsByEmail = settings.getSendCardsByEmail();
        this.email = settings.getEmail();

        if (settings.getProcessesStatesNotNotified() != null)
            this.processesStatesNotNotified = new HashMap<>(settings.getProcessesStatesNotNotified());
        else
            this.processesStatesNotNotified = null;

        if (settings.getEntitiesDisconnected() != null)
            this.entitiesDisconnected = new ArrayList<>(settings.getEntitiesDisconnected());
        else
            this.entitiesDisconnected = null;
    }


    public UserSettingsData clearProcessesStatesNotNotified(){
        setProcessesStatesNotNotified(null);
        return this;
    }

    public UserSettingsData clearEntitiesDisconnected(){
        setEntitiesDisconnected(null);
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
        result.description = ObjectUtils.getNotNullOrDefault(other.getDescription(), this.getDescription());
        result.locale = ObjectUtils.getNotNullOrDefault( other.getLocale(), this.getLocale());

        result.playSoundForAlarm = ObjectUtils.getNotNullOrDefault( other.getPlaySoundForAlarm(), this.getPlaySoundForAlarm());
        result.playSoundForAction = ObjectUtils.getNotNullOrDefault( other.getPlaySoundForAction(), this.getPlaySoundForAction());
        result.playSoundForCompliant = ObjectUtils.getNotNullOrDefault( other.getPlaySoundForCompliant(), this.getPlaySoundForCompliant());
        result.playSoundForInformation = ObjectUtils.getNotNullOrDefault( other.getPlaySoundForInformation(), this.getPlaySoundForInformation());

        result.systemNotificationAlarm = ObjectUtils.getNotNullOrDefault( other.getSystemNotificationAlarm(), this.getSystemNotificationAlarm());
        result.systemNotificationAction = ObjectUtils.getNotNullOrDefault( other.getSystemNotificationAction(), this.getSystemNotificationAction());
        result.systemNotificationCompliant = ObjectUtils.getNotNullOrDefault( other.getSystemNotificationCompliant(), this.getSystemNotificationCompliant());
        result.systemNotificationInformation = ObjectUtils.getNotNullOrDefault( other.getSystemNotificationInformation(), this.getSystemNotificationInformation());

        result.playSoundOnExternalDevice = ObjectUtils.getNotNullOrDefault( other.getPlaySoundOnExternalDevice(), this.getPlaySoundOnExternalDevice());
        result.replayEnabled = ObjectUtils.getNotNullOrDefault( other.getReplayEnabled(), this.getReplayEnabled());

        result.replayInterval = ObjectUtils.getNotNullOrDefault( other.getReplayInterval(), this.getReplayInterval());
        result.remoteLoggingEnabled = ObjectUtils.getNotNullOrDefault( other.getRemoteLoggingEnabled(), this.getRemoteLoggingEnabled());
        result.processesStatesNotNotified = ObjectUtils.getNotNullOrDefault( other.getProcessesStatesNotNotified(), this.getProcessesStatesNotNotified(), HashMap::new);
        result.entitiesDisconnected = ObjectUtils.getNotNullOrDefault( other.getEntitiesDisconnected(), this.getEntitiesDisconnected(), ArrayList::new);
        result.sendCardsByEmail = ObjectUtils.getNotNullOrDefault( other.getSendCardsByEmail(), this.getSendCardsByEmail());
        result.email = ObjectUtils.getNotNullOrDefault( other.getEmail(), this.getEmail());

        return result;
    }

}
