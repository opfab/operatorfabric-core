/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, map} from 'rxjs';
import {GroupsService} from '../../../services/groups/GroupsService';
import {CrudUtilities} from './crudUtils';

export class CrudGroupsService {
    getAll(): Observable<Array<any>> {
        return GroupsService.getAll().pipe(
            map((groups) => {
                return groups.map((group) => ({
                    ...group,
                    perimeters: CrudUtilities.formatArrayToString(group.perimeters),
                    permissions: CrudUtilities.formatArrayToString(group.permissions)
                }));
            })
        );
    }

    update(data: any): Observable<any> {
        return GroupsService.update(data);
    }

    deleteById(id: string): Observable<any> {
        return GroupsService.deleteById(id);
    }

    getCachedValues(): Array<any> {
        const groups = GroupsService.getCachedValues();
        return groups.map((group) => ({
            ...group,
            perimeters: CrudUtilities.formatArrayToString(group.perimeters),
            permissions: CrudUtilities.formatArrayToString(group.permissions)
        }));
    }
}
