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
import {EditPerimeterModalComponent} from '../editmodal/perimeters/edit-perimeter-modal.component';

@Component({
  templateUrl: 'admin-table.directive.html',
  selector: 'of-perimeters-table'
})
export class PerimetersTableComponent extends AdminTableDirective implements OnInit {

  tableType = AdminItemType.PERIMETER;
  fields = [new Field('id'), new Field('process'), new Field('stateRights', 7, 'stateRightsCellRenderer')];
  idField = 'id';
  editModalComponent = EditPerimeterModalComponent;
  modalOptions = {...AdminTableDirective.defaultModalOptions, size: 'xl'};

}
