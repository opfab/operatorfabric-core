/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.*;

@Document(collection = "user")
public class User {

    @Id
    @NotNull
    private String login;
    private String firstName;
    private String lastName;
    private String comment;
    private Set<String> entities;

    @JsonIgnore
    private Set<String> groupSet;
    private Set<String> authorizedIPAddresses;

    public User() {
    }

    

    public User(@NotNull String login, String firstName, String lastName, String comment, Set<String> entities,
            Set<String> groupSet, Set<String> authorizedIPAddresses) {
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.comment = comment;
        this.entities = entities;
        this.groupSet = groupSet;
        this.authorizedIPAddresses = authorizedIPAddresses;
    }


    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public void addGroup(String group) {
        if (null == groupSet) {
            this.groupSet = new HashSet<>();
        }
        groupSet.add(group);
    }

    public Set<String> getGroupSet() {
        if (this.groupSet == null)
            return Collections.emptySet();
        return groupSet;
    }

    public List<String> getGroups() {
        if (groupSet == null)
            return Collections.emptyList();
        return new ArrayList<>(groupSet);
    }

    public void setGroups(List<String> groups) {
        groupSet = new HashSet<>(groups);
    }

    public void deleteGroup(String name) {
        groupSet.remove(name);
    }

    public void addEntity(String entity) {
        if (null == entities) {
            this.entities = new HashSet<>();
        }
        entities.add(entity);
    }

    public List<String> getEntities() {
        if (entities == null)
            return Collections.emptyList();
        return new ArrayList<>(entities);
    }

    public void setEntities(List<String> entities) {
        this.entities = new HashSet<>(entities);
    }

    public void deleteEntity(String name) {
        entities.remove(name);
    }

    public void addAuthorizedIPAddress(String address) {
        if (null == authorizedIPAddresses) {
            this.authorizedIPAddresses = new HashSet<>();
        }
        authorizedIPAddresses.add(address);
    }

    public List<String> getAuthorizedIPAddresses() {
        if (authorizedIPAddresses == null)
            return Collections.emptyList();
        return new ArrayList<>(authorizedIPAddresses);
    }

    public void setAuthorizedIPAddresses(List<String> authorizedIPAddresses) {
        this.authorizedIPAddresses = new HashSet<>(authorizedIPAddresses);
    }

    public void deleteAuthorizedIPAddress(String address) {
        authorizedIPAddresses.remove(address);

    }


    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((login == null) ? 0 : login.hashCode());
        result = prime * result + ((firstName == null) ? 0 : firstName.hashCode());
        result = prime * result + ((lastName == null) ? 0 : lastName.hashCode());
        result = prime * result + ((comment == null) ? 0 : comment.hashCode());
        result = prime * result + ((entities == null) ? 0 : entities.hashCode());
        result = prime * result + ((groupSet == null) ? 0 : groupSet.hashCode());
        result = prime * result + ((authorizedIPAddresses == null) ? 0 : authorizedIPAddresses.hashCode());
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
        User other = (User) obj;
        if (login == null) {
            if (other.login != null)
                return false;
        } else if (!login.equals(other.login))
            return false;
        if (firstName == null) {
            if (other.firstName != null)
                return false;
        } else if (!firstName.equals(other.firstName))
            return false;
        if (lastName == null) {
            if (other.lastName != null)
                return false;
        } else if (!lastName.equals(other.lastName))
            return false;
        if (comment == null) {
            if (other.comment != null)
                return false;
        } else if (!comment.equals(other.comment))
            return false;
        if (entities == null) {
            if (other.entities != null)
                return false;
        } else if (!entities.equals(other.entities))
            return false;
        if (groupSet == null) {
            if (other.groupSet != null)
                return false;
        } else if (!groupSet.equals(other.groupSet))
            return false;
        if (authorizedIPAddresses == null) {
            if (other.authorizedIPAddresses != null)
                return false;
        } else if (!authorizedIPAddresses.equals(other.authorizedIPAddresses))
            return false;
        return true;
    }

}
