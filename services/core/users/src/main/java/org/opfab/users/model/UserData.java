/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

/**
 * !! Please use Builder to instantiate !!
 *
 * User Model, documented at {@link User}
 *
 * {@inheritDoc}
 *
 */
@Document(collection = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserData implements User {

    @Id
    private String login;
    private String firstName;
    private String lastName;

    @JsonIgnore
    @Singular("entity")
    private Set<String> entities;

    @JsonIgnore
    @Singular("group")
    private Set<String> groupSet;

    public UserData(User user){
        this();
        this.login = user.getLogin();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.entities = new HashSet<>(user.getEntities());
        this.groupSet = new HashSet<>(user.getGroups());

    }

    public void addGroup(String group){
        if(null== groupSet){
            this.groupSet=new HashSet<>();
        }
        groupSet.add(group);
    }

    public Set<String> getGroupSet(){
        if(this.groupSet ==null)
            return Collections.emptySet();
        return groupSet;
    }

    @Override
    public List<String> getGroups() {
        if(groupSet == null)
            return Collections.emptyList();
        return new ArrayList<>(groupSet);
    }

    @Override
    public void setGroups(List<String> groups) {
        groupSet = new HashSet<>(groups);
    }

    public void deleteGroup(String name) {
        groupSet.remove(name);
    }


    public void addEntity(String entity){
        if(null== entities){
            this.entities=new HashSet<>();
        }
        entities.add(entity);
    }


    @Override
    public List<String> getEntities() {
        if(entities == null)
            return Collections.emptyList();
        return new ArrayList<>(entities);
    }

    @Override
    public void setEntities(List<String> entities) {
        this.entities = new HashSet<>(entities);
    }

    public void deleteEntity(String name) {
        entities.remove(name);

    }

}
