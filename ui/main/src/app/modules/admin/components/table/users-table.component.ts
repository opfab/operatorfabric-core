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
import {EditUserModalComponent} from '../editmodal/users/edit-user-modal.component';
import {AdminTableDirective, Field} from './admin-table.directive';
import {AdminItemType} from '../../services/sharing.service';

@Component({
  templateUrl: 'admin-table.directive.html',
  selector: 'of-users-table'
})
export class UsersTableComponent extends AdminTableDirective implements OnInit {

  tableType = AdminItemType.USER;
  fields = [new Field('login'), new Field('firstName'), new Field('lastName'),
    new Field('groups', 8, 'groupCellRenderer'), new Field('entities', 8, 'entityCellRenderer')];
  idField = 'login';
  editModalComponent = EditUserModalComponent;

}

