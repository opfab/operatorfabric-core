/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, map} from 'rxjs';
import {EntitiesService} from '../entities/EntitiesService';
import {CrudUtilities} from './CrudUtils';

export class CrudEntitiesService {
    getAll(): Observable<Array<any>> {
        return EntitiesService.getAll().pipe(
            map((entities) => {
                return entities.map((entity) => ({
                    ...entity,
                    parents: CrudUtilities.formatEntityIdsToNames(entity.parents)
                }));
            })
        );
    }

    update(data: any): Observable<any> {
        return EntitiesService.update(data);
    }

    deleteById(id: string): Observable<any> {
        return EntitiesService.deleteById(id);
    }

    getCachedValues(): Array<any> {
        const entities = EntitiesService.getCachedValues();
        return entities.map((entity) => ({
            ...entity,
            parents: CrudUtilities.formatEntityIdsToNames(entity.parents)
        }));
    }
}
