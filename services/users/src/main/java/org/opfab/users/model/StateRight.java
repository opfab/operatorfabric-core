/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.model;

import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonInclude;


@Validated
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class StateRight{
    private String state;
    private RightEnum right;
    private Boolean filteringNotificationAllowed = true;

    public StateRight() {
    }
    
    public StateRight(String state, RightEnum right, Boolean filteringNotificationAllowed) {
        this.state = state;
        this.right = right;
        this.filteringNotificationAllowed = filteringNotificationAllowed;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
    
    public RightEnum getRight() {
        return right;
    }

    public void setRight(RightEnum right) {
        this.right = right;
    }

    public Boolean getFilteringNotificationAllowed() {
        return filteringNotificationAllowed;
    }

    public void setFilteringNotificationAllowed(Boolean filteringNotificationAllowed) {
        this.filteringNotificationAllowed = filteringNotificationAllowed;
    }

    @Override
    public String toString() {
        return "StateRightData [state=" + state + ", right=" + right + ", filteringNotificationAllowed="
                + filteringNotificationAllowed + "]";
    }

    

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((state == null) ? 0 : state.hashCode());
        result = prime * result + ((right == null) ? 0 : right.hashCode());
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
        StateRight other = (StateRight) obj;
        if (state == null) {
            if (other.state != null)
                return false;
        } else if (!state.equals(other.state))
            return false;
        if (right != other.right)
            return false;
        if (filteringNotificationAllowed == null) {
            if (other.filteringNotificationAllowed != null)
                return false;
        } else if (!filteringNotificationAllowed.equals(other.filteringNotificationAllowed))
            return false;
        return true;
    }

    
}
