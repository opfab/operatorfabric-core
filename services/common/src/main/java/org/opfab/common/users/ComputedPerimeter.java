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

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * ComputedPerimeter
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ComputedPerimeter {
    private String process = null;

    private String state = null;

    private RightEnum rights = null;

    private Boolean filteringNotificationAllowed = null;

    public ComputedPerimeter process(String process) {
        this.process = process;
        return this;
    }

    public String getProcess() {
        return process;
    }

    public void setProcess(String process) {
        this.process = process;
    }

    public ComputedPerimeter state(String state) {
        this.state = state;
        return this;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public ComputedPerimeter rights(RightEnum rights) {
        this.rights = rights;
        return this;
    }

    public RightEnum getRights() {
        return rights;
    }

    public void setRights(RightEnum rights) {
        this.rights = rights;
    }

    public ComputedPerimeter filteringNotificationAllowed(Boolean filteringNotificationAllowed) {
        this.filteringNotificationAllowed = filteringNotificationAllowed;
        return this;
    }

    public Boolean getFilteringNotificationAllowed() {
        return filteringNotificationAllowed;
    }

    public void setFilteringNotificationAllowed(Boolean filteringNotificationAllowed) {
        this.filteringNotificationAllowed = filteringNotificationAllowed;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ComputedPerimeter computedPerimeter = (ComputedPerimeter) o;
        return Objects.equals(this.process, computedPerimeter.process) &&
                Objects.equals(this.state, computedPerimeter.state) &&
                Objects.equals(this.rights, computedPerimeter.rights) &&
                Objects.equals(this.filteringNotificationAllowed, computedPerimeter.filteringNotificationAllowed);
    }

    @Override
    public int hashCode() {
        return Objects.hash(process, state, rights, filteringNotificationAllowed);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class ComputedPerimeter {\n");

        sb.append("    process: ").append(toIndentedString(process)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    rights: ").append(toIndentedString(rights)).append("\n");
        sb.append("    filteringNotificationAllowed: ").append(toIndentedString(filteringNotificationAllowed))
                .append("\n");
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
