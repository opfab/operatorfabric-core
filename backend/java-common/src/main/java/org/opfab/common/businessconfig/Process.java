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
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Process {
    private String id = null;

    private String name = null;

    private String version = null;

    private Map<String, ProcessStates> states = null;

    private ProcessUiVisibility uiVisibility = null;

    public Process id(String id) {
        this.id = id;
        return this;
    }

    /**
     * Identifier referencing this process. It should be unique across the
     * OperatorFabric instance.
     * 
     **/
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Process name(String name) {
        this.name = name;
        return this;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Process version(String version) {
        this.version = version;
        return this;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Process states(Map<String, ProcessStates> states) {
        this.states = states;
        return this;
    }

    public Process putStatesItem(String key, ProcessStates statesItem) {
        if (this.states == null) {
            this.states = new HashMap<>();
        }
        this.states.put(key, statesItem);
        return this;
    }

    public Map<String, ProcessStates> getStates() {
        return states;
    }

    public void setStates(Map<String, ProcessStates> states) {
        this.states = states;
    }

    public Process uiVisibility(ProcessUiVisibility uiVisibility) {
        this.uiVisibility = uiVisibility;
        return this;
    }

    public ProcessUiVisibility getUiVisibility() {
        return uiVisibility;
    }

    public void setUiVisibility(ProcessUiVisibility uiVisibility) {
        this.uiVisibility = uiVisibility;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Process process = (Process) o;
        return Objects.equals(this.id, process.id) &&
                Objects.equals(this.name, process.name) &&
                Objects.equals(this.version, process.version) &&
                Objects.equals(this.states, process.states) &&
                Objects.equals(this.uiVisibility, process.uiVisibility);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, version, states, uiVisibility);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Process {\n");

        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    version: ").append(toIndentedString(version)).append("\n");
        sb.append("    states: ").append(toIndentedString(states)).append("\n");
        sb.append("    uiVisibility: ").append(toIndentedString(uiVisibility)).append("\n");
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
