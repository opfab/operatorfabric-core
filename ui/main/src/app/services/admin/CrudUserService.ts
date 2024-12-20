/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, map} from 'rxjs';
import {UsersService} from '../users/UsersService';
import {CrudUtilities} from './CrudUtils';

export class CrudUserService {
    getAll(): Observable<Array<any>> {
        return UsersService.getAll().pipe(
            map((users) => {
                return users.map((user) => ({
                    ...user,
                    groups: CrudUtilities.formatGroupIdsToNames(user.groups),
                    entities: CrudUtilities.formatEntityIdsToNames(user.entities)
                }));
            })
        );
    }

    update(data: any): Observable<any> {
        return UsersService.update(data);
    }

    deleteById(id: string): Observable<any> {
        return UsersService.deleteById(id);
    }

    getCachedValues(): Array<any> {
        throw new Error('getCachedValue not implemented');
    }
}
