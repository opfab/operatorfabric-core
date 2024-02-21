/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import org.opfab.utilities.ObjectUtils;

@Document(collection = "user_settings")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserSettings {

    @Id
    private String login;
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
    private Boolean emailToPlainText;
    private Boolean sendDailyEmail;
    private String email;
    private Map<String, List<String>> processesStatesNotNotified;
    private Map<String, List<String>> processesStatesNotifiedByEmail;
    private List<String> entitiesDisconnected;

    public UserSettings() {
    }

    public UserSettings(UserSettings settings) {
        this.login = settings.getLogin();
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
        this.emailToPlainText = settings.getEmailToPlainText();
        this.sendDailyEmail = settings.getSendDailyEmail();
        this.email = settings.getEmail();

        if (settings.getProcessesStatesNotNotified() != null)
            this.processesStatesNotNotified = new HashMap<>(settings.getProcessesStatesNotNotified());
        else
            this.processesStatesNotNotified = null;

        if (settings.getProcessesStatesNotifiedByEmail() != null)
            this.processesStatesNotifiedByEmail = new HashMap<>(settings.getProcessesStatesNotifiedByEmail());
        else
            this.processesStatesNotifiedByEmail = null;

        if (settings.getEntitiesDisconnected() != null)
            this.entitiesDisconnected = new ArrayList<>(settings.getEntitiesDisconnected());
        else
            this.entitiesDisconnected = null;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public Boolean getPlaySoundForAlarm() {
        return playSoundForAlarm;
    }

    public void setPlaySoundForAlarm(Boolean playSoundForAlarm) {
        this.playSoundForAlarm = playSoundForAlarm;
    }

    public Boolean getPlaySoundForAction() {
        return playSoundForAction;
    }

    public void setPlaySoundForAction(Boolean playSoundForAction) {
        this.playSoundForAction = playSoundForAction;
    }

    public Boolean getPlaySoundForCompliant() {
        return playSoundForCompliant;
    }

    public void setPlaySoundForCompliant(Boolean playSoundForCompliant) {
        this.playSoundForCompliant = playSoundForCompliant;
    }

    public Boolean getPlaySoundForInformation() {
        return playSoundForInformation;
    }

    public void setPlaySoundForInformation(Boolean playSoundForInformation) {
        this.playSoundForInformation = playSoundForInformation;
    }

    public Boolean getPlaySoundOnExternalDevice() {
        return playSoundOnExternalDevice;
    }

    public void setPlaySoundOnExternalDevice(Boolean playSoundOnExternalDevice) {
        this.playSoundOnExternalDevice = playSoundOnExternalDevice;
    }

    public Boolean getSystemNotificationAlarm() {
        return systemNotificationAlarm;
    }

    public void setSystemNotificationAlarm(Boolean systemNotificationAlarm) {
        this.systemNotificationAlarm = systemNotificationAlarm;
    }

    public Boolean getSystemNotificationAction() {
        return systemNotificationAction;
    }

    public void setSystemNotificationAction(Boolean systemNotificationAction) {
        this.systemNotificationAction = systemNotificationAction;
    }

    public Boolean getSystemNotificationCompliant() {
        return systemNotificationCompliant;
    }

    public void setSystemNotificationCompliant(Boolean systemNotificationCompliant) {
        this.systemNotificationCompliant = systemNotificationCompliant;
    }

    public Boolean getSystemNotificationInformation() {
        return systemNotificationInformation;
    }

    public void setSystemNotificationInformation(Boolean systemNotificationInformation) {
        this.systemNotificationInformation = systemNotificationInformation;
    }

    public Boolean getReplayEnabled() {
        return replayEnabled;
    }

    public void setReplayEnabled(Boolean replayEnabled) {
        this.replayEnabled = replayEnabled;
    }

    public Integer getReplayInterval() {
        return replayInterval;
    }

    public void setReplayInterval(Integer replayInterval) {
        this.replayInterval = replayInterval;
    }

    public Boolean getRemoteLoggingEnabled() {
        return remoteLoggingEnabled;
    }

    public void setRemoteLoggingEnabled(Boolean remoteLoggingEnabled) {
        this.remoteLoggingEnabled = remoteLoggingEnabled;
    }

    public Boolean getSendCardsByEmail() {
        return sendCardsByEmail;
    }

    public void setSendCardsByEmail(Boolean sendCardsByEmail) {
        this.sendCardsByEmail = sendCardsByEmail;
    }

    public Boolean getEmailToPlainText() {
        return emailToPlainText;
    }

    public void setEmailToPlainText(Boolean emailToPlainText) {
        this.emailToPlainText = emailToPlainText;
    }

    public Boolean getSendDailyEmail() {
        return sendDailyEmail;
    }

    public void setSendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
    }
    
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Map<String, List<String>> getProcessesStatesNotNotified() {
        return processesStatesNotNotified;
    }

    public void setProcessesStatesNotNotified(Map<String, List<String>> processesStatesNotNotified) {
        this.processesStatesNotNotified = processesStatesNotNotified;
    }

    public Map<String, List<String>> getProcessesStatesNotifiedByEmail() {
        return processesStatesNotifiedByEmail;
    }

    public void setProcessesStatesNotifiedByEmail(Map<String, List<String>> processesStatesNotifiedByEmail) {
        this.processesStatesNotifiedByEmail = processesStatesNotifiedByEmail;
    }

    public List<String> getEntitiesDisconnected() {
        return entitiesDisconnected;
    }

    public void setEntitiesDisconnected(List<String> entitiesDisconnected) {
        this.entitiesDisconnected = entitiesDisconnected;
    }

    public UserSettings clearProcessesStatesNotNotified() {
        setProcessesStatesNotNotified(null);
        return this;
    }

    public UserSettings clearEntitiesDisconnected() {
        setEntitiesDisconnected(null);
        return this;
    }

    /**
     * Create a new patched settings using this as reference and overriding fields
     * from other parameter when field is not
     * null.
     * <br>
     * NB: login cannot be changed
     *
     * @param other
     * @return
     */
    public UserSettings patch(UserSettings other) {
        UserSettings result = new UserSettings();
        result.login = this.login;
        result.locale = ObjectUtils.getNotNullOrDefault(other.getLocale(), this.getLocale());

        result.playSoundForAlarm = ObjectUtils.getNotNullOrDefault(other.getPlaySoundForAlarm(),
                this.getPlaySoundForAlarm());
        result.playSoundForAction = ObjectUtils.getNotNullOrDefault(other.getPlaySoundForAction(),
                this.getPlaySoundForAction());
        result.playSoundForCompliant = ObjectUtils.getNotNullOrDefault(other.getPlaySoundForCompliant(),
                this.getPlaySoundForCompliant());
        result.playSoundForInformation = ObjectUtils.getNotNullOrDefault(other.getPlaySoundForInformation(),
                this.getPlaySoundForInformation());

        result.systemNotificationAlarm = ObjectUtils.getNotNullOrDefault(other.getSystemNotificationAlarm(),
                this.getSystemNotificationAlarm());
        result.systemNotificationAction = ObjectUtils.getNotNullOrDefault(other.getSystemNotificationAction(),
                this.getSystemNotificationAction());
        result.systemNotificationCompliant = ObjectUtils.getNotNullOrDefault(other.getSystemNotificationCompliant(),
                this.getSystemNotificationCompliant());
        result.systemNotificationInformation = ObjectUtils.getNotNullOrDefault(other.getSystemNotificationInformation(),
                this.getSystemNotificationInformation());

        result.playSoundOnExternalDevice = ObjectUtils.getNotNullOrDefault(other.getPlaySoundOnExternalDevice(),
                this.getPlaySoundOnExternalDevice());
        result.replayEnabled = ObjectUtils.getNotNullOrDefault(other.getReplayEnabled(), this.getReplayEnabled());

        result.replayInterval = ObjectUtils.getNotNullOrDefault(other.getReplayInterval(), this.getReplayInterval());
        result.remoteLoggingEnabled = ObjectUtils.getNotNullOrDefault(other.getRemoteLoggingEnabled(),
                this.getRemoteLoggingEnabled());
        result.processesStatesNotNotified = ObjectUtils.getNotNullOrDefault(other.getProcessesStatesNotNotified(),
                this.getProcessesStatesNotNotified(), HashMap::new);
        result.processesStatesNotifiedByEmail = ObjectUtils.getNotNullOrDefault(
                other.getProcessesStatesNotifiedByEmail(), this.getProcessesStatesNotifiedByEmail(), HashMap::new);
        result.entitiesDisconnected = ObjectUtils.getNotNullOrDefault(other.getEntitiesDisconnected(),
                this.getEntitiesDisconnected(), ArrayList::new);
        result.sendCardsByEmail = ObjectUtils.getNotNullOrDefault(other.getSendCardsByEmail(),
                this.getSendCardsByEmail());
        result.emailToPlainText = ObjectUtils.getNotNullOrDefault(other.getEmailToPlainText(),
                this.getEmailToPlainText());
        result.sendDailyEmail = ObjectUtils.getNotNullOrDefault(other.getSendDailyEmail(),
                this.getSendDailyEmail());
        result.email = ObjectUtils.getNotNullOrDefault(other.getEmail(), this.getEmail());

        return result;
    }

}
