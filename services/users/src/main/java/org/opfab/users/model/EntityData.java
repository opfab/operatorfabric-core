/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Entity Model, documented at {@link Entity}
 * <p>
 * {@inheritDoc}
 */
@Document(collection = "entity")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class EntityData implements Entity {
    @Id
    private String id;
    private String name;
    private String description;
    private Set<String> labels;

    @Builder.Default
    private Boolean entityAllowedToSendCard = true;

    private Set<String> parents;

    public EntityData(Entity entity) {
        this();
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.entityAllowedToSendCard = entity.getEntityAllowedToSendCard();
        this.parents = entity.getParents().stream().collect(Collectors.toSet());
    }

    @Override
    public List<String> getLabels(){
        if (labels == null) return Collections.emptyList();
        return labels.stream().collect(Collectors.toList());
    }

    @Override
    public void setLabels(List<String> labels){
        this.labels = Collections.emptySet();
        if(labels != null) {
            this.labels = labels.stream().collect(Collectors.toSet());
        }

    }

    @Override
    public List<String> getParents(){
        if (parents == null) return Collections.emptyList();
        return parents.stream().collect(Collectors.toList());
    }

    @Override
    public void setParents(List<String> parents){
        this.parents = Collections.emptySet();
        if(parents != null) {
            this.parents = parents.stream().collect(Collectors.toSet());
        }

    }
}
