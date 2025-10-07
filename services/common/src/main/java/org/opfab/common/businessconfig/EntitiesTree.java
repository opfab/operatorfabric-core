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
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Object containing the id of the entity and an optional list of connection
 * levels with 0 meaning the entity itself, 1 for first level children, 2 for
 * 2nd level connections, etc.
 */

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EntitiesTree {
    private String id = null;

    private List<Integer> levels = null;

    public EntitiesTree id(String id) {
        this.id = id;
        return this;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public EntitiesTree levels(List<Integer> levels) {
        this.levels = levels;
        return this;
    }

    public EntitiesTree addLevelsItem(Integer levelsItem) {
        if (this.levels == null) {
            this.levels = new ArrayList<>();
        }
        this.levels.add(levelsItem);
        return this;
    }

    public List<Integer> getLevels() {
        return levels;
    }

    public void setLevels(List<Integer> levels) {
        this.levels = levels;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        EntitiesTree entitiesTree = (EntitiesTree) o;
        return Objects.equals(this.id, entitiesTree.id) &&
                Objects.equals(this.levels, entitiesTree.levels);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, levels);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class EntitiesTree {\n");

        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    levels: ").append(toIndentedString(levels)).append("\n");
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
