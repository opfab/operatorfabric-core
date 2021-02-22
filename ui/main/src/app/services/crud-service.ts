/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ErrorService} from '@ofServices/error-service';

@Injectable({
    providedIn: 'root'
})
export abstract class CrudService extends ErrorService {
  abstract getAll(): Observable<Array<any>>;
  abstract update(data: any): Observable<any>;
  abstract deleteById(id: string): Observable<any>;

}
