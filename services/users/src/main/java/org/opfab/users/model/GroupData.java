/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

/**
 * Group Model, documented at {@link Group}
 *
 * {@inheritDoc}
 *
 */
@Document(collection = "group")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class GroupData implements Group {
    @Id
    private String id;
    private String name;
    private GroupTypeEnum type;
    private String description;


    @JsonIgnore
    @Singular("perimeter")
    private Set<String> perimeters;

    @Builder.Default
    private Boolean realtime = false;


    public GroupData(GroupData groupData) {
        this.id = groupData.id;
        this.name = groupData.name;
        this.type= groupData.type;
        this.description = groupData.description;
        if (groupData.perimeters==null) this.perimeters = new HashSet<>();
        else this.perimeters = new HashSet<>(groupData.perimeters);
        this.realtime =   groupData.realtime;
    }

    @Override
    public List<String> getPerimeters() {
        if(perimeters == null)
            return Collections.emptyList();
        return new ArrayList<>(perimeters);
    }

    @Override
    public void setPerimeters(List<String> perimeters) {
        this.perimeters = new HashSet<>(perimeters);
    }

    public void addPerimeter(String idParameter){
        if (null == perimeters){
            this.perimeters = new HashSet<>();
        }
        perimeters.add(idParameter);
    }

    public void deletePerimeter(String id) {
        perimeters.remove(id);
    }
}
