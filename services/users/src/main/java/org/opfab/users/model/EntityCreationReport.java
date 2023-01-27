/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

public class EntityCreationReport<T> {
    
    private boolean update;
    private T entity;


    
    public EntityCreationReport(boolean update, T entity) {
        this.update = update;
        this.entity = entity;
    }


    public boolean isUpdate() {
        return update;
    }
    public T getEntity() {
        return entity;
    }

    

}
