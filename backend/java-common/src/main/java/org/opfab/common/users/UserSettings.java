/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.common.users;

import java.util.Objects;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserSettings {
    private String login = null;

    private String locale = null;

    private Boolean playSoundForAlarm = null;

    private Boolean playSoundForAction = null;

    private Boolean playSoundForCompliant = null;

    private Boolean playSoundForInformation = null;

    private Boolean systemNotificationAlarm = null;

    private Boolean systemNotificationAction = null;

    private Boolean systemNotificationCompliant = null;

    private Boolean systemNotificationInformation = null;

    private Boolean playSoundOnExternalDevice = null;

    private Boolean replayEnabled = null;

    private Integer replayInterval = null;

    private Boolean hallwayMode = null;

    private Boolean remoteLoggingEnabled = null;

    private Boolean showAcknowledgmentFooter = null;

    private Boolean openNextCardOnAcknowledgment = null;

    private Map<String, List<String>> processesStatesNotNotified = null;

    private Map<String, List<String>> processesStatesNotifiedByEmail = null;

    private List<String> entitiesDisconnected = null;

    private Boolean sendCardsByEmail = null;

    private Boolean emailToPlainText = null;

    private Boolean sendDailyEmail = null;

    private Boolean sendWeeklyEmail = null;

    private String email = null;

    private String timezoneForEmails = null;

    public UserSettings login(String login) {
        this.login = login;
        return this;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public UserSettings locale(String locale) {
        this.locale = locale;
        return this;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public UserSettings playSoundForAlarm(Boolean playSoundForAlarm) {
        this.playSoundForAlarm = playSoundForAlarm;
        return this;
    }

    public Boolean getPlaySoundForAlarm() {
        return playSoundForAlarm;
    }

    public void setPlaySoundForAlarm(Boolean playSoundForAlarm) {
        this.playSoundForAlarm = playSoundForAlarm;
    }

    public UserSettings playSoundForAction(Boolean playSoundForAction) {
        this.playSoundForAction = playSoundForAction;
        return this;
    }

    public Boolean getPlaySoundForAction() {
        return playSoundForAction;
    }

    public void setPlaySoundForAction(Boolean playSoundForAction) {
        this.playSoundForAction = playSoundForAction;
    }

    public UserSettings playSoundForCompliant(Boolean playSoundForCompliant) {
        this.playSoundForCompliant = playSoundForCompliant;
        return this;
    }

    public Boolean getPlaySoundForCompliant() {
        return playSoundForCompliant;
    }

    public void setPlaySoundForCompliant(Boolean playSoundForCompliant) {
        this.playSoundForCompliant = playSoundForCompliant;
    }

    public UserSettings playSoundForInformation(Boolean playSoundForInformation) {
        this.playSoundForInformation = playSoundForInformation;
        return this;
    }

    public Boolean getPlaySoundForInformation() {
        return playSoundForInformation;
    }

    public void setPlaySoundForInformation(Boolean playSoundForInformation) {
        this.playSoundForInformation = playSoundForInformation;
    }

    public UserSettings systemNotificationAlarm(Boolean systemNotificationAlarm) {
        this.systemNotificationAlarm = systemNotificationAlarm;
        return this;
    }

    public Boolean getSystemNotificationAlarm() {
        return systemNotificationAlarm;
    }

    public void setSystemNotificationAlarm(Boolean systemNotificationAlarm) {
        this.systemNotificationAlarm = systemNotificationAlarm;
    }

    public UserSettings systemNotificationAction(Boolean systemNotificationAction) {
        this.systemNotificationAction = systemNotificationAction;
        return this;
    }

    public Boolean getSystemNotificationAction() {
        return systemNotificationAction;
    }

    public void setSystemNotificationAction(Boolean systemNotificationAction) {
        this.systemNotificationAction = systemNotificationAction;
    }

    public UserSettings systemNotificationCompliant(Boolean systemNotificationCompliant) {
        this.systemNotificationCompliant = systemNotificationCompliant;
        return this;
    }

    public Boolean getSystemNotificationCompliant() {
        return systemNotificationCompliant;
    }

    public void setSystemNotificationCompliant(Boolean systemNotificationCompliant) {
        this.systemNotificationCompliant = systemNotificationCompliant;
    }

    public UserSettings systemNotificationInformation(Boolean systemNotificationInformation) {
        this.systemNotificationInformation = systemNotificationInformation;
        return this;
    }

    public Boolean getSystemNotificationInformation() {
        return systemNotificationInformation;
    }

    public void setSystemNotificationInformation(Boolean systemNotificationInformation) {
        this.systemNotificationInformation = systemNotificationInformation;
    }

    public UserSettings playSoundOnExternalDevice(Boolean playSoundOnExternalDevice) {
        this.playSoundOnExternalDevice = playSoundOnExternalDevice;
        return this;
    }

    public Boolean getPlaySoundOnExternalDevice() {
        return playSoundOnExternalDevice;
    }

    public void setPlaySoundOnExternalDevice(Boolean playSoundOnExternalDevice) {
        this.playSoundOnExternalDevice = playSoundOnExternalDevice;
    }

    public UserSettings replayEnabled(Boolean replayEnabled) {
        this.replayEnabled = replayEnabled;
        return this;
    }

    public Boolean getReplayEnabled() {
        return replayEnabled;
    }

    public void setReplayEnabled(Boolean replayEnabled) {
        this.replayEnabled = replayEnabled;
    }

    public UserSettings replayInterval(Integer replayInterval) {
        this.replayInterval = replayInterval;
        return this;
    }

    public Integer getReplayInterval() {
        return replayInterval;
    }

    public void setReplayInterval(Integer replayInterval) {
        this.replayInterval = replayInterval;
    }

    public UserSettings hallwayMode(Boolean hallwayMode) {
        this.hallwayMode = hallwayMode;
        return this;
    }

    public Boolean getHallwayMode() {
        return hallwayMode;
    }

    public void setHallwayMode(Boolean hallwayMode) {
        this.hallwayMode = hallwayMode;
    }

    public UserSettings remoteLoggingEnabled(Boolean remoteLoggingEnabled) {
        this.remoteLoggingEnabled = remoteLoggingEnabled;
        return this;
    }

    public Boolean getRemoteLoggingEnabled() {
        return remoteLoggingEnabled;
    }

    public void setRemoteLoggingEnabled(Boolean remoteLoggingEnabled) {
        this.remoteLoggingEnabled = remoteLoggingEnabled;
    }

    public UserSettings showAcknowledgmentFooter(Boolean showAcknowledgmentFooter) {
        this.showAcknowledgmentFooter = showAcknowledgmentFooter;
        return this;
    }

    public Boolean getShowAcknowledgmentFooter() {
        return showAcknowledgmentFooter;
    }

    public void setShowAcknowledgmentFooter(Boolean showAcknowledgmentFooter) {
        this.showAcknowledgmentFooter = showAcknowledgmentFooter;
    }

    public UserSettings openNextCardOnAcknowledgment(Boolean openNextCardOnAcknowledgment) {
        this.openNextCardOnAcknowledgment = openNextCardOnAcknowledgment;
        return this;
    }

    public Boolean getOpenNextCardOnAcknowledgment() {
        return openNextCardOnAcknowledgment;
    }

    public void setOpenNextCardOnAcknowledgment(Boolean openNextCardOnAcknowledgment) {
        this.openNextCardOnAcknowledgment = openNextCardOnAcknowledgment;
    }

    public UserSettings processesStatesNotNotified(Map<String, List<String>> processesStatesNotNotified) {
        this.processesStatesNotNotified = processesStatesNotNotified;
        return this;
    }

    public UserSettings putProcessesStatesNotNotifiedItem(String key, List<String> processesStatesNotNotifiedItem) {
        if (this.processesStatesNotNotified == null) {
            this.processesStatesNotNotified = new HashMap<>();
        }
        this.processesStatesNotNotified.put(key, processesStatesNotNotifiedItem);
        return this;
    }

    public Map<String, List<String>> getProcessesStatesNotNotified() {
        return processesStatesNotNotified;
    }

    public void setProcessesStatesNotNotified(Map<String, List<String>> processesStatesNotNotified) {
        this.processesStatesNotNotified = processesStatesNotNotified;
    }

    public UserSettings processesStatesNotifiedByEmail(Map<String, List<String>> processesStatesNotifiedByEmail) {
        this.processesStatesNotifiedByEmail = processesStatesNotifiedByEmail;
        return this;
    }

    public UserSettings putProcessesStatesNotifiedByEmailItem(String key,
            List<String> processesStatesNotifiedByEmailItem) {
        if (this.processesStatesNotifiedByEmail == null) {
            this.processesStatesNotifiedByEmail = new HashMap<>();
        }
        this.processesStatesNotifiedByEmail.put(key, processesStatesNotifiedByEmailItem);
        return this;
    }

    public Map<String, List<String>> getProcessesStatesNotifiedByEmail() {
        return processesStatesNotifiedByEmail;
    }

    public void setProcessesStatesNotifiedByEmail(Map<String, List<String>> processesStatesNotifiedByEmail) {
        this.processesStatesNotifiedByEmail = processesStatesNotifiedByEmail;
    }

    public UserSettings entitiesDisconnected(List<String> entitiesDisconnected) {
        this.entitiesDisconnected = entitiesDisconnected;
        return this;
    }

    public UserSettings addEntitiesDisconnectedItem(String entitiesDisconnectedItem) {
        if (this.entitiesDisconnected == null) {
            this.entitiesDisconnected = new ArrayList<>();
        }
        this.entitiesDisconnected.add(entitiesDisconnectedItem);
        return this;
    }

    public List<String> getEntitiesDisconnected() {
        return entitiesDisconnected;
    }

    public void setEntitiesDisconnected(List<String> entitiesDisconnected) {
        this.entitiesDisconnected = entitiesDisconnected;
    }

    public UserSettings sendCardsByEmail(Boolean sendCardsByEmail) {
        this.sendCardsByEmail = sendCardsByEmail;
        return this;
    }

    public Boolean getSendCardsByEmail() {
        return sendCardsByEmail;
    }

    public void setSendCardsByEmail(Boolean sendCardsByEmail) {
        this.sendCardsByEmail = sendCardsByEmail;
    }

    public UserSettings emailToPlainText(Boolean emailToPlainText) {
        this.emailToPlainText = emailToPlainText;
        return this;
    }

    public Boolean getEmailToPlainText() {
        return emailToPlainText;
    }

    public void setEmailToPlainText(Boolean emailToPlainText) {
        this.emailToPlainText = emailToPlainText;
    }

    public UserSettings sendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
        return this;
    }

    public Boolean getSendDailyEmail() {
        return sendDailyEmail;
    }

    public void setSendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
    }

    public UserSettings sendWeeklyEmail(Boolean sendWeeklyEmail) {
        this.sendWeeklyEmail = sendWeeklyEmail;
        return this;
    }

    public Boolean getSendWeeklyEmail() {
        return sendWeeklyEmail;
    }

    public void setSendWeeklyEmail(Boolean sendWeeklyEmail) {
        this.sendWeeklyEmail = sendWeeklyEmail;
    }

    public UserSettings email(String email) {
        this.email = email;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserSettings timezoneForEmails(String timezoneForEmails) {
        this.timezoneForEmails = timezoneForEmails;
        return this;
    }

    public String getTimezoneForEmails() {
        return timezoneForEmails;
    }

    public void setTimezoneForEmails(String timezoneForEmails) {
        this.timezoneForEmails = timezoneForEmails;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserSettings userSettings = (UserSettings) o;
        return Objects.equals(this.login, userSettings.login) &&
                Objects.equals(this.locale, userSettings.locale) &&
                Objects.equals(this.playSoundForAlarm, userSettings.playSoundForAlarm) &&
                Objects.equals(this.playSoundForAction, userSettings.playSoundForAction) &&
                Objects.equals(this.playSoundForCompliant, userSettings.playSoundForCompliant) &&
                Objects.equals(this.playSoundForInformation, userSettings.playSoundForInformation) &&
                Objects.equals(this.systemNotificationAlarm, userSettings.systemNotificationAlarm) &&
                Objects.equals(this.systemNotificationAction, userSettings.systemNotificationAction) &&
                Objects.equals(this.systemNotificationCompliant, userSettings.systemNotificationCompliant) &&
                Objects.equals(this.systemNotificationInformation, userSettings.systemNotificationInformation) &&
                Objects.equals(this.playSoundOnExternalDevice, userSettings.playSoundOnExternalDevice) &&
                Objects.equals(this.replayEnabled, userSettings.replayEnabled) &&
                Objects.equals(this.replayInterval, userSettings.replayInterval) &&
                Objects.equals(this.hallwayMode, userSettings.hallwayMode) &&
                Objects.equals(this.remoteLoggingEnabled, userSettings.remoteLoggingEnabled) &&
                Objects.equals(this.showAcknowledgmentFooter, userSettings.showAcknowledgmentFooter) &&
                Objects.equals(this.openNextCardOnAcknowledgment, userSettings.openNextCardOnAcknowledgment) &&
                Objects.equals(this.processesStatesNotNotified, userSettings.processesStatesNotNotified) &&
                Objects.equals(this.processesStatesNotifiedByEmail, userSettings.processesStatesNotifiedByEmail) &&
                Objects.equals(this.entitiesDisconnected, userSettings.entitiesDisconnected) &&
                Objects.equals(this.sendCardsByEmail, userSettings.sendCardsByEmail) &&
                Objects.equals(this.emailToPlainText, userSettings.emailToPlainText) &&
                Objects.equals(this.sendDailyEmail, userSettings.sendDailyEmail) &&
                Objects.equals(this.sendWeeklyEmail, userSettings.sendWeeklyEmail) &&
                Objects.equals(this.email, userSettings.email) &&
                Objects.equals(this.timezoneForEmails, userSettings.timezoneForEmails);
    }

    @Override
    public int hashCode() {
        return Objects.hash(login, locale, playSoundForAlarm, playSoundForAction, playSoundForCompliant,
                playSoundForInformation, systemNotificationAlarm, systemNotificationAction, systemNotificationCompliant,
                systemNotificationInformation, playSoundOnExternalDevice, replayEnabled, replayInterval, hallwayMode,
                remoteLoggingEnabled, showAcknowledgmentFooter, openNextCardOnAcknowledgment,
                processesStatesNotNotified, processesStatesNotifiedByEmail, entitiesDisconnected, sendCardsByEmail,
                emailToPlainText, sendDailyEmail, sendWeeklyEmail, email, timezoneForEmails);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class UserSettings {\n");

        sb.append("    login: ").append(toIndentedString(login)).append("\n");
        sb.append("    locale: ").append(toIndentedString(locale)).append("\n");
        sb.append("    playSoundForAlarm: ").append(toIndentedString(playSoundForAlarm)).append("\n");
        sb.append("    playSoundForAction: ").append(toIndentedString(playSoundForAction)).append("\n");
        sb.append("    playSoundForCompliant: ").append(toIndentedString(playSoundForCompliant)).append("\n");
        sb.append("    playSoundForInformation: ").append(toIndentedString(playSoundForInformation)).append("\n");
        sb.append("    systemNotificationAlarm: ").append(toIndentedString(systemNotificationAlarm)).append("\n");
        sb.append("    systemNotificationAction: ").append(toIndentedString(systemNotificationAction)).append("\n");
        sb.append("    systemNotificationCompliant: ").append(toIndentedString(systemNotificationCompliant))
                .append("\n");
        sb.append("    systemNotificationInformation: ").append(toIndentedString(systemNotificationInformation))
                .append("\n");
        sb.append("    playSoundOnExternalDevice: ").append(toIndentedString(playSoundOnExternalDevice)).append("\n");
        sb.append("    replayEnabled: ").append(toIndentedString(replayEnabled)).append("\n");
        sb.append("    replayInterval: ").append(toIndentedString(replayInterval)).append("\n");
        sb.append("    hallwayMode: ").append(toIndentedString(hallwayMode)).append("\n");
        sb.append("    remoteLoggingEnabled: ").append(toIndentedString(remoteLoggingEnabled)).append("\n");
        sb.append("    showAcknowledgmentFooter: ").append(toIndentedString(showAcknowledgmentFooter)).append("\n");
        sb.append("    openNextCardOnAcknowledgment: ").append(toIndentedString(openNextCardOnAcknowledgment))
                .append("\n");
        sb.append("    processesStatesNotNotified: ").append(toIndentedString(processesStatesNotNotified)).append("\n");
        sb.append("    processesStatesNotifiedByEmail: ").append(toIndentedString(processesStatesNotifiedByEmail))
                .append("\n");
        sb.append("    entitiesDisconnected: ").append(toIndentedString(entitiesDisconnected)).append("\n");
        sb.append("    sendCardsByEmail: ").append(toIndentedString(sendCardsByEmail)).append("\n");
        sb.append("    emailToPlainText: ").append(toIndentedString(emailToPlainText)).append("\n");
        sb.append("    sendDailyEmail: ").append(toIndentedString(sendDailyEmail)).append("\n");
        sb.append("    sendWeeklyEmail: ").append(toIndentedString(sendWeeklyEmail)).append("\n");
        sb.append("    email: ").append(toIndentedString(email)).append("\n");
        sb.append("    timezoneForEmails: ").append(toIndentedString(timezoneForEmails)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(java.lang.Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
