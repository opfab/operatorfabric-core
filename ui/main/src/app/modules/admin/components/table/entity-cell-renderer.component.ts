/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {ArrayCellRendererComponent} from './array-cell-renderer.component';
import {AdminItemType} from '../../services/sharing.service';


@Component({
    selector: 'of-entity-cell-renderer',
    templateUrl: 'array-cell-renderer.component.html'
})
export class EntityCellRendererComponent extends ArrayCellRendererComponent {

    /** Defining components extending ArrayCellComponent proved necessary rather than using generics or passing the type as a
     * constructor parameter because ag-grid only accepts non-generic class names in column definitions.
     * */

    itemType = AdminItemType.ENTITY;
}
