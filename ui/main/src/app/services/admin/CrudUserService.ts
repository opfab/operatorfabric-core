/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, map} from 'rxjs';
import {UserService} from '../../business/services/users/user.service';
import {CrudUtilities} from './CrudUtils';

export class CrudUserService {
    getAll(): Observable<Array<any>> {
        return UserService.getAll().pipe(
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
        return UserService.update(data);
    }

    deleteById(id: string): Observable<any> {
        return UserService.deleteById(id);
    }

    getCachedValues(): Array<any> {
        throw new Error('getCachedValue not implemented');
    }
}
