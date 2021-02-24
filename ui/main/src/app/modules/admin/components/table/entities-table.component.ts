/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {AdminTableDirective, Field} from './admin-table.directive';
import {EditEntityModalComponent} from '../editmodal/entities/edit-entity-modal.component';
import {AdminItemType} from '../../services/sharing.service';

@Component({
  templateUrl: 'admin-table.directive.html',
  selector: 'of-entities-table'
})
export class EntitiesTableComponent extends AdminTableDirective implements OnInit {

  tableType = AdminItemType.ENTITY;
  fields = [new Field('id', 3), new Field('name', 3), new Field('description', 5), new Field('parents', 5, 'entityCellRenderer')];
  idField = 'id';
  editModalComponent = EditEntityModalComponent;

}
