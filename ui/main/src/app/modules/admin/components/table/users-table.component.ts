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
import {UserService} from '@ofServices/user.service';
import {EditUserModalComponent} from '../editmodal/users/edit-user-modal.component';
import {CrudService} from "@ofServices/crud-service";
import {HttpClient} from "@angular/common/http";
import {AdminTableComponent, AdminTableType} from "./admin-table.component";

@Component({
  templateUrl: 'admin-table.component.html',
  providers:  [{provide: CrudService, useClass: UserService, deps: [HttpClient]}],
  selector: 'of-users-table'
})
export class UsersTableComponent extends AdminTableComponent implements OnInit {

  tableType = AdminTableType.USER;
  fields = ['login', 'firstName', 'lastName', 'groups', 'entities'];
  idField = 'login';
  editModalComponent = EditUserModalComponent;

}

