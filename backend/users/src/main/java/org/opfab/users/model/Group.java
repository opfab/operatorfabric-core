/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.validation.annotation.Validated;

import java.util.*;

@Document(collection = "group")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public class Group {
    @Id
    @NotNull
    private String id;
    private String name;
    private String description;
    private Set<String> perimeters;
    private Set<PermissionEnum> permissions;

    @Transient
    private Set<String> users;

    public Group(String id) {
        this.id = id;
    }

    public Group() {
        this.perimeters = new HashSet<>();
        this.permissions = new HashSet<>();
    }

    public Group(@NotNull String id, String name, String description, Set<String> perimeters,
            Set<PermissionEnum> permissions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.perimeters = perimeters;
        this.permissions = permissions;
    }

    public Group(Group groupData) {
        this.id = groupData.id;
        this.name = groupData.name;
        this.description = groupData.description;
        if (groupData.perimeters == null)
            this.perimeters = new HashSet<>();
        else
            this.perimeters = new HashSet<>(groupData.perimeters);
        if (groupData.permissions == null)
            this.permissions = new HashSet<>();
        else
            this.permissions = new HashSet<>(groupData.permissions);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getPerimeters() {
        if (perimeters == null)
            return Collections.emptyList();
        return new ArrayList<>(perimeters);
    }

    public void setPerimeters(List<String> perimeters) {
        this.perimeters = new HashSet<>(perimeters);
    }

    public void addPerimeter(String idParameter) {
        if (null == perimeters) {
            this.perimeters = new HashSet<>();
        }
        perimeters.add(idParameter);
    }

    public void deletePerimeter(String id) {
        perimeters.remove(id);
    }

    public List<PermissionEnum> getPermissions() {
        if (permissions == null)
            return Collections.emptyList();
        return new ArrayList<>(permissions);
    }

    public void setPermissions(List<PermissionEnum> permissions) {
        this.permissions = new HashSet<>(permissions);
    }

    public void addPermission(PermissionEnum permission) {
        if (null == permissions) {
            this.permissions = new HashSet<>();
        }
        permissions.add(permission);
    }

    public void deletePermission(PermissionEnum permission) {
        permissions.remove(permission);
    }

    public List<String> getUsers() {
        if (users == null) {
            // we need to return null in case 'users' field is not in the post query, to differentiate with an empty
            // array of users
            return null;//NOSONAR
        }
        return new ArrayList<>(users);
    }

    public void setUsers(List<String> users) {
        if (users != null) {
            this.users = new HashSet<>(users);
        }
    }
}
