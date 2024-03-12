/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.util.*;

@Document(collection = "perimeter")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public class Perimeter{
    
    @Id
    @NotNull
    private String id;
    private String process;
    private List<StateRight> stateRights;

    public Perimeter() {
    }
    
    public Perimeter(@NotNull String id, String process, List<StateRight> stateRights) {
        this.id = id;
        this.process = process;
        this.stateRights = stateRights;
    }

    public Perimeter (Perimeter perimeterData) {
        this.id = perimeterData.id;
        this.process = perimeterData.process;
        if (perimeterData.stateRights!=null)  this.stateRights = new ArrayList<>(perimeterData.stateRights);
        else this.stateRights = new ArrayList<>();
    }

    public void setStateRights(List<StateRight> stateRights) {
        this.stateRights = new ArrayList<>(stateRights);
    }

    public List<StateRight> getStateRights() {
        if(stateRights == null)
            return Collections.emptyList();
        return stateRights;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProcess() {
        return process;
    }

    public void setProcess(String process) {
        this.process = process;
    }

    @Override
    public String toString() {
        return "PerimeterData [id=" + id + ", process=" + process + ", stateRights=" + stateRights + "]";
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((process == null) ? 0 : process.hashCode());
        result = prime * result + ((stateRights == null) ? 0 : stateRights.hashCode());
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
        Perimeter other = (Perimeter) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (process == null) {
            if (other.process != null)
                return false;
        } else if (!process.equals(other.process))
            return false;
        if (stateRights == null) {
            if (other.stateRights != null)
                return false;
        } else if (!stateRights.equals(other.stateRights))
            return false;
        return true;
    }

    
}
