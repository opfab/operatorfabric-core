/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;

@Component
@ConfigurationProperties(prefix = "operatorfabric.cards-publication.purge")
public class CardPurgeProperties {

    private boolean activate = true;
    private String purgeTime = "15:00";

    private int defaultDaysToKeepCardsAfterPublication = 30;
    private int defaultDaysToKeepArchivesCardsAfterPublication = 365;

    private int defaultDaysToKeepCardsAfterEndDate = 30;
    private int defaultDaysToKeepArchivesCardsAfterEndDate = 365;

    public boolean isActivate() {
        return activate;
    }

    public void setActivate(boolean activate) {
        this.activate = activate;
    }

    public String getPurgeTime() {
        return purgeTime;
    }

    public void setPurgeTime(String purgeTime) {
        this.purgeTime = purgeTime;
    }

    public int getDefaultDaysToKeepCardsAfterPublication() {
        return defaultDaysToKeepCardsAfterPublication;
    }

    public void setDefaultDaysToKeepCardsAfterPublication(int v) {
        if (v < 0) {
            throw new IllegalArgumentException(
                    "operatorfabric.cards-publication.purge.defaultDaysToKeepCardsAfterPublication must be >= 0");
        }
        this.defaultDaysToKeepCardsAfterPublication = v;
    }

    public int getDefaultDaysToKeepArchivesCardsAfterPublication() {
        return defaultDaysToKeepArchivesCardsAfterPublication;
    }

    public void setDefaultDaysToKeepArchivesCardsAfterPublication(int v) {
        if (v < 0) {
            throw new IllegalArgumentException(
                    "operatorfabric.cards-publication.purge.defaultDaysToKeepArchivesCardsAfterPublication must be >= 0");
        }
        this.defaultDaysToKeepArchivesCardsAfterPublication = v;
    }

    public int getDefaultDaysToKeepCardsAfterEndDate() {
        return defaultDaysToKeepCardsAfterEndDate;
    }

    public void setDefaultDaysToKeepCardsAfterEndDate(int v) {
        if (v < 0) {
            throw new IllegalArgumentException(
                    "operatorfabric.cards-publication.purge.defaultDaysToKeepCardsAfterEndDate must be >= 0");
        }
        this.defaultDaysToKeepCardsAfterEndDate = v;
    }

    public int getDefaultDaysToKeepArchivesCardsAfterEndDate() {
        return defaultDaysToKeepArchivesCardsAfterEndDate;
    }

    public void setDefaultDaysToKeepArchivesCardsAfterEndDate(int v) {
        if (v < 0) {
            throw new IllegalArgumentException(
                    "operatorfabric.cards-publication.purge.defaultDaysToKeepArchivesCardsAfterEndDate must be >= 0");
        }
        this.defaultDaysToKeepArchivesCardsAfterEndDate = v;
    }

    /**
     * Convert "HH:mm" -> Spring cron "0 mm HH * * *"
     */
    public String toCron() {
        LocalTime time;
        try {
            time = LocalTime.parse(purgeTime);
        } catch (DateTimeParseException e) {
            throw new IllegalStateException(
                    "Invalid operatorfabric.cards-publication.purge.purgeTime: '" + purgeTime + "' (expected HH:mm)", e);
        }
        return String.format("0 %d %d * * *", time.getMinute(), time.getHour());
    }
}