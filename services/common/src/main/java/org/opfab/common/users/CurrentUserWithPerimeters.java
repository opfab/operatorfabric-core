/* Copyright (c) 2025, RTE (http://www.rte-france.com)
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

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CurrentUserWithPerimeters {
    private User userData = null;

    private List<ComputedPerimeter> computedPerimeters = null;

    private Map<String, List<String>> processesStatesNotNotified = null;

    private Map<String, List<String>> processesStatesNotifiedByEmail = null;

    private Boolean sendCardsByEmail = null;

    private Boolean emailToPlainText = null;

    private Boolean sendDailyEmail = null;

    private Boolean sendWeeklyEmail = null;

    private String emailForCardSending = null;

    private String timezoneForEmails = null;

    private List<PermissionEnum> permissions = null;

    public CurrentUserWithPerimeters userData(User userData) {
        this.userData = userData;
        return this;
    }

    public User getUserData() {
        return userData;
    }

    public void setUserData(User userData) {
        this.userData = userData;
    }

    public CurrentUserWithPerimeters computedPerimeters(List<ComputedPerimeter> computedPerimeters) {
        this.computedPerimeters = computedPerimeters;
        return this;
    }

    public CurrentUserWithPerimeters addComputedPerimetersItem(ComputedPerimeter computedPerimetersItem) {
        if (this.computedPerimeters == null) {
            this.computedPerimeters = new ArrayList<>();
        }
        this.computedPerimeters.add(computedPerimetersItem);
        return this;
    }

    public List<ComputedPerimeter> getComputedPerimeters() {
        return computedPerimeters;
    }

    public void setComputedPerimeters(List<ComputedPerimeter> computedPerimeters) {
        this.computedPerimeters = computedPerimeters;
    }

    public CurrentUserWithPerimeters processesStatesNotNotified(Map<String, List<String>> processesStatesNotNotified) {
        this.processesStatesNotNotified = processesStatesNotNotified;
        return this;
    }

    public CurrentUserWithPerimeters putProcessesStatesNotNotifiedItem(String key,
            List<String> processesStatesNotNotifiedItem) {
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

    public CurrentUserWithPerimeters processesStatesNotifiedByEmail(
            Map<String, List<String>> processesStatesNotifiedByEmail) {
        this.processesStatesNotifiedByEmail = processesStatesNotifiedByEmail;
        return this;
    }

    public CurrentUserWithPerimeters putProcessesStatesNotifiedByEmailItem(String key,
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

    public CurrentUserWithPerimeters sendCardsByEmail(Boolean sendCardsByEmail) {
        this.sendCardsByEmail = sendCardsByEmail;
        return this;
    }

    public Boolean getSendCardsByEmail() {
        return sendCardsByEmail;
    }

    public void setSendCardsByEmail(Boolean sendCardsByEmail) {
        this.sendCardsByEmail = sendCardsByEmail;
    }

    public CurrentUserWithPerimeters emailToPlainText(Boolean emailToPlainText) {
        this.emailToPlainText = emailToPlainText;
        return this;
    }

    public Boolean getEmailToPlainText() {
        return emailToPlainText;
    }

    public void setEmailToPlainText(Boolean emailToPlainText) {
        this.emailToPlainText = emailToPlainText;
    }

    public CurrentUserWithPerimeters sendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
        return this;
    }

    public Boolean getSendDailyEmail() {
        return sendDailyEmail;
    }

    public void setSendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
    }

    public CurrentUserWithPerimeters sendWeeklyEmail(Boolean sendWeeklyEmail) {
        this.sendWeeklyEmail = sendWeeklyEmail;
        return this;
    }

    public Boolean getSendWeeklyEmail() {
        return sendWeeklyEmail;
    }

    public void setSendWeeklyEmail(Boolean sendWeeklyEmail) {
        this.sendWeeklyEmail = sendWeeklyEmail;
    }

    public CurrentUserWithPerimeters emailForCardSending(String emailForCardSending) {
        this.emailForCardSending = emailForCardSending;
        return this;
    }

    public String getEmailForCardSending() {
        return emailForCardSending;
    }

    public void setEmailForCardSending(String emailForCardSending) {
        this.emailForCardSending = emailForCardSending;
    }

    public CurrentUserWithPerimeters timezoneForEmails(String timezoneForEmails) {
        this.timezoneForEmails = timezoneForEmails;
        return this;
    }

    public String getTimezoneForEmails() {
        return timezoneForEmails;
    }

    public void setTimezoneForEmails(String timezoneForEmails) {
        this.timezoneForEmails = timezoneForEmails;
    }

    public CurrentUserWithPerimeters permissions(List<PermissionEnum> permissions) {
        this.permissions = permissions;
        return this;
    }

    public CurrentUserWithPerimeters addPermissionsItem(PermissionEnum permissionsItem) {
        if (this.permissions == null) {
            this.permissions = new ArrayList<>();
        }
        this.permissions.add(permissionsItem);
        return this;
    }

    public List<PermissionEnum> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionEnum> permissions) {
        this.permissions = permissions;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CurrentUserWithPerimeters currentUserWithPerimeters = (CurrentUserWithPerimeters) o;
        return Objects.equals(this.userData, currentUserWithPerimeters.userData) &&
                Objects.equals(this.computedPerimeters, currentUserWithPerimeters.computedPerimeters) &&
                Objects.equals(this.processesStatesNotNotified, currentUserWithPerimeters.processesStatesNotNotified) &&
                Objects.equals(this.processesStatesNotifiedByEmail,
                        currentUserWithPerimeters.processesStatesNotifiedByEmail)
                &&
                Objects.equals(this.sendCardsByEmail, currentUserWithPerimeters.sendCardsByEmail) &&
                Objects.equals(this.emailToPlainText, currentUserWithPerimeters.emailToPlainText) &&
                Objects.equals(this.sendDailyEmail, currentUserWithPerimeters.sendDailyEmail) &&
                Objects.equals(this.sendWeeklyEmail, currentUserWithPerimeters.sendWeeklyEmail) &&
                Objects.equals(this.emailForCardSending, currentUserWithPerimeters.emailForCardSending) &&
                Objects.equals(this.timezoneForEmails, currentUserWithPerimeters.timezoneForEmails) &&
                Objects.equals(this.permissions, currentUserWithPerimeters.permissions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userData, computedPerimeters, processesStatesNotNotified, processesStatesNotifiedByEmail,
                sendCardsByEmail, emailToPlainText, sendDailyEmail, sendWeeklyEmail, emailForCardSending,
                timezoneForEmails, permissions);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class CurrentUserWithPerimeters {\n");

        sb.append("    userData: ").append(toIndentedString(userData)).append("\n");
        sb.append("    computedPerimeters: ").append(toIndentedString(computedPerimeters)).append("\n");
        sb.append("    processesStatesNotNotified: ").append(toIndentedString(processesStatesNotNotified)).append("\n");
        sb.append("    processesStatesNotifiedByEmail: ").append(toIndentedString(processesStatesNotifiedByEmail))
                .append("\n");
        sb.append("    sendCardsByEmail: ").append(toIndentedString(sendCardsByEmail)).append("\n");
        sb.append("    emailToPlainText: ").append(toIndentedString(emailToPlainText)).append("\n");
        sb.append("    sendDailyEmail: ").append(toIndentedString(sendDailyEmail)).append("\n");
        sb.append("    sendWeeklyEmail: ").append(toIndentedString(sendWeeklyEmail)).append("\n");
        sb.append("    emailForCardSending: ").append(toIndentedString(emailForCardSending)).append("\n");
        sb.append("    timezoneForEmails: ").append(toIndentedString(timezoneForEmails)).append("\n");
        sb.append("    permissions: ").append(toIndentedString(permissions)).append("\n");
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
