/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AbstractControl, ValidationErrors} from '@angular/forms';
import {CrudService} from '@ofServices/crud-service';


export class IdValidatorService {

  constructor(
    private crudService: CrudService) {
  }

  isIdAvailable(control: AbstractControl): Promise<ValidationErrors> | null {
    return new Promise((resolve, reject) => {
      this.crudService.getAll().subscribe((response) => {
        if (response.filter(
          row => {
            let id: string;
            if (row.login) id = row.login;
            else id = row.id;
            return id.toLowerCase().trim() === (control.value as string).toLowerCase().trim();
          }).length > 0) {
          resolve({ shouldbeUnique: true });
        } else {
          resolve(null);
        }
      });
    });
  }
}
