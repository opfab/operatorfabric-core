/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;

@Validated
public class ComputedPerimeter  {

    @JsonProperty("process")  
    private String process;

    @JsonProperty("state")
    private String state;

    @JsonProperty("rights")
    @Valid
    private RightEnum rights;

    @JsonProperty("filteringNotificationAllowed")
    private Boolean filteringNotificationAllowed;

    public String getProcess() {
        return process;
    }

    public void setProcess(String process) {
        this.process = process;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public RightEnum getRights() {
        return rights;
    }

    public void setRights(RightEnum rights) {
        this.rights = rights;
    }

    public Boolean getFilteringNotificationAllowed() {
        return filteringNotificationAllowed;
    }

    public void setFilteringNotificationAllowed(Boolean filteringNotificationAllowed) {
        this.filteringNotificationAllowed = filteringNotificationAllowed;
    }

    @Override
    public String toString() {
        return "ComputedPerimeterData [process=" + process + ", state=" + state + ", rights=" + rights
                + ", filteringNotificationAllowed=" + filteringNotificationAllowed + "]";
    }


    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((process == null) ? 0 : process.hashCode());
        result = prime * result + ((state == null) ? 0 : state.hashCode());
        result = prime * result + ((rights == null) ? 0 : rights.hashCode());
        result = prime * result
                + ((filteringNotificationAllowed == null) ? 0 : filteringNotificationAllowed.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        ComputedPerimeter other = (ComputedPerimeter) obj;
        if (process == null) {
            if (other.process != null)
                return false;
        } else if (!process.equals(other.process))
            return false;
        if (state == null) {
            if (other.state != null)
                return false;
        } else if (!state.equals(other.state))
            return false;
        if (rights != other.rights)
            return false;
        if (filteringNotificationAllowed == null) {
            if (other.filteringNotificationAllowed != null)
                return false;
        } else if (!filteringNotificationAllowed.equals(other.filteringNotificationAllowed))
            return false;
        return true;
    }


    

    
}

