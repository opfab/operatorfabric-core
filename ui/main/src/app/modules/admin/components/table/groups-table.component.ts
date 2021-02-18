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
import {EditEntityGroupModalComponent} from '../editmodal/groups-entities/edit-entity-group-modal.component';
import {AdminItemType} from '../../services/sharing.service';

@Component({
  templateUrl: 'admin-table.directive.html',
  selector: 'of-groups-table'
})
export class GroupsTableComponent extends AdminTableDirective implements OnInit {

  tableType = AdminItemType.GROUP;
  fields = [new Field('id'), new Field('name'), new Field('description')];
  idField = 'id';
  editModalComponent = EditEntityGroupModalComponent;

}
