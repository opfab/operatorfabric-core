/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {CrudService} from './CrudService';
import {AdminProcessesService} from './AdminProcessesService';

export class CrudProcessesService extends CrudService {
    getAll(): Observable<Array<any>> {
        return AdminProcessesService.getAll();
    }

    update(data: any): Observable<any> {
        return AdminProcessesService.update(data);
    }

    deleteById(id: string): Observable<any> {
        return AdminProcessesService.deleteById(id);
    }

    getCachedValues(): Array<any> {
        throw new Error('getCachedValue not implemented');
    }
}
