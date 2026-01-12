/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.common.users;

import java.util.Set;

import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.Valid;

@Validated
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CurrentUserWithPerimeters {

    @Valid
    private User userData;
    @Valid
    private Set<ComputedPerimeter> computedPerimeters;
    @Valid
    private Map<String, List<String>> processesStatesNotNotified;
    @Valid
    private Map<String, List<String>> processesStatesNotifiedByEmail;

    private Boolean sendCardsByEmail;
    private Boolean emailToPlainText;
    private Boolean sendDailyEmail;
    private Boolean sendWeeklyEmail;
    private String emailForCardSending;
    private String timezoneForEmails;

    @Valid
    private Set<PermissionEnum> permissions;

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

    public Boolean getSendWeeklyEmail() {
        return sendWeeklyEmail;
    }

    public void setSendDailyEmail(Boolean sendDailyEmail) {
        this.sendDailyEmail = sendDailyEmail;
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

    public String getTimezoneForEmails() {
        return timezoneForEmails;
    }

    public void setTimezoneForEmails(String timezoneForEmails) {
        this.timezoneForEmails = timezoneForEmails;
    }

    public User getUserData() {
        return userData;
    }

    public void setUserData(User userData) {
        this.userData = userData;
    }

    public void setComputedPerimeters(List<ComputedPerimeter> computedPerimeters) {
        this.computedPerimeters = new HashSet<>(computedPerimeters);
    }

    public List<ComputedPerimeter> getComputedPerimeters() {
        if (computedPerimeters == null)
            return Collections.emptyList();
        return new ArrayList<>(computedPerimeters);
    }

    public void addComputedPerimeters(ComputedPerimeter c) {
        if (null == computedPerimeters) {
            this.computedPerimeters = new HashSet<>();
        }
        computedPerimeters.add(c);
    }

    public List<PermissionEnum> getPermissions() {
        if (permissions == null)
            return Collections.emptyList();
        return new ArrayList<>(permissions);
    }

    public void setPermissions(List<PermissionEnum> permissions) {
        this.permissions = new HashSet<>(permissions);
    }
}
