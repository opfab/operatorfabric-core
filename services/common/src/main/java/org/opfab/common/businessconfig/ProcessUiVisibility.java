/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.common.businessconfig;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProcessUiVisibility {
    private Boolean monitoring = false;

    private Boolean processMonitoring = false;

    private Boolean logging = false;

    private Boolean calendar = false;

    public ProcessUiVisibility monitoring(Boolean monitoring) {
        this.monitoring = monitoring;
        return this;
    }

    public Boolean getMonitoring() {
        return monitoring;
    }

    public void setMonitoring(Boolean monitoring) {
        this.monitoring = monitoring;
    }

    public ProcessUiVisibility processMonitoring(Boolean processMonitoring) {
        this.processMonitoring = processMonitoring;
        return this;
    }

    public Boolean getProcessMonitoring() {
        return processMonitoring;
    }

    public void setProcessMonitoring(Boolean processMonitoring) {
        this.processMonitoring = processMonitoring;
    }

    public ProcessUiVisibility logging(Boolean logging) {
        this.logging = logging;
        return this;
    }

    public Boolean getLogging() {
        return logging;
    }

    public void setLogging(Boolean logging) {
        this.logging = logging;
    }

    public ProcessUiVisibility calendar(Boolean calendar) {
        this.calendar = calendar;
        return this;
    }

    public Boolean getCalendar() {
        return calendar;
    }

    public void setCalendar(Boolean calendar) {
        this.calendar = calendar;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ProcessUiVisibility processUiVisibility = (ProcessUiVisibility) o;
        return Objects.equals(this.monitoring, processUiVisibility.monitoring) &&
                Objects.equals(this.processMonitoring, processUiVisibility.processMonitoring) &&
                Objects.equals(this.logging, processUiVisibility.logging) &&
                Objects.equals(this.calendar, processUiVisibility.calendar);
    }

    @Override
    public int hashCode() {
        return Objects.hash(monitoring, processMonitoring, logging, calendar);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class ProcessUiVisibility {\n");

        sb.append("    monitoring: ").append(toIndentedString(monitoring)).append("\n");
        sb.append("    processMonitoring: ").append(toIndentedString(processMonitoring)).append("\n");
        sb.append("    logging: ").append(toIndentedString(logging)).append("\n");
        sb.append("    calendar: ").append(toIndentedString(calendar)).append("\n");
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
