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

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.stream.Collectors;


@Document(collection = "entity")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public class Entity {
    @Id
    @NotNull
    private String id;
    private String name;
    private String description;
    private Set<String> labels;
    private Set<String> parents;
    @Valid
    private SortedSet<RoleEnum> roles;

    @Transient
    private Set<String> users;


    public Entity(@NotNull String id, String name, String description, Set<String> labels, Set<String> parents, @Valid SortedSet<RoleEnum> roles) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.labels = labels;
        this.parents = parents;
        this.roles = roles;
    }

    public Entity() {
        this.labels = new HashSet<>();
        this.parents = new HashSet<>();
        this.roles = new TreeSet<>();
    }

    public Entity(Entity entityData) {
        this.id = entityData.id;
        this.name = entityData.name;
        this.description = entityData.description;
        if (entityData.labels==null) this.labels = new HashSet<>();
        else this.labels = new HashSet<>(entityData.labels);
        if (entityData.parents==null) this.parents = new HashSet<>();
        else this.parents = new HashSet<>(entityData.parents);
        if (entityData.roles==null) this.roles = new TreeSet<>();
        else this.roles = new TreeSet<>(entityData.roles);
    }


    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }


    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public List<String> getLabels(){
        if (labels == null) return Collections.emptyList();
        return labels.stream().toList();
    }


    public void setLabels(List<String> labels){
        this.labels = Collections.emptySet();
        if(labels != null) {
            this.labels = labels.stream().collect(Collectors.toSet());
        }

    }

    public List<String> getParents(){
        if (parents == null) return Collections.emptyList();
        return new ArrayList<>(parents); // to have a mutable list
    }

    public void setParents(List<String> parents){
        this.parents = Collections.emptySet();
        if(parents != null) {
            this.parents = parents.stream().collect(Collectors.toSet());
        }

    }

    public List<RoleEnum> getRoles(){
        if (roles == null) return Collections.emptyList();
        return roles.stream().toList();
    }

    public void setRoles(List<RoleEnum> roles){
        this.roles = new TreeSet<>();
        if(roles != null) {
            this.roles = roles.stream().collect(Collectors.toCollection(TreeSet::new));
        }

    }

    public List<String> getUsers() {
        if (users == null)
            return Collections.emptyList();
        return new ArrayList<>(users);
    }

    public void setUsers(List<String> users) {
        this.users = new HashSet<>(users);
    }
}
