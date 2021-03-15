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
import {AdminItemType} from '../../services/sharing.service';
import {EditGroupModalComponent} from '../editmodal/groups/edit-group-modal.component';

@Component({
  templateUrl: 'admin-table.directive.html',
  selector: 'of-groups-table'
})
export class GroupsTableComponent extends AdminTableDirective implements OnInit {

  tableType = AdminItemType.GROUP;
  fields = [new Field('id', 3), new Field('name', 3), new Field('description', 4), new Field('perimeters', 6)];
  idField = 'id';
  editModalComponent = EditGroupModalComponent;

}
