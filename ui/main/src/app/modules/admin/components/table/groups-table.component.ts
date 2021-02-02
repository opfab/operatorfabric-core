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
import {CrudService} from "@ofServices/crud-service";
import {HttpClient} from "@angular/common/http";
import {AdminTableComponent, AdminTableType} from "./admin-table.component";
import {EditEntityGroupModalComponent} from "../editmodal/groups-entities/edit-entity-group-modal.component";
import {GroupsService} from "@ofServices/groups.service";

@Component({
  templateUrl: 'admin-table.component.html',
  providers:  [{provide: CrudService, useClass: GroupsService, deps: [HttpClient]}],
  selector: 'of-groups-table'
})
export class GroupsTableComponent extends AdminTableComponent implements OnInit {

  tableType = AdminTableType.GROUP;
  fields = ['id', 'name', 'description'];
  idField = 'id';
  editModalComponent = EditEntityGroupModalComponent;

}
