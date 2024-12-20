/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable, OnDestroy} from '@angular/core';
import {CrudService} from '@ofServices/admin/CrudService';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PerimetersService} from '@ofServices/perimeters/PerimetersService';
import {CrudProcessesService} from '@ofServices/admin/CrudProcessesService';
import {CrudUserService} from '@ofServices/admin/CrudUserService';
import {CrudEntitiesService} from '@ofServices/admin/CrudEntitiesService';
import {CrudGroupsService} from '@ofServices/admin/CrudGroupsService';
import {CrudPerimetersService} from '@ofServices/admin/CrudPerimetersService';
import {CrudBusinessDataService} from '@ofServices/admin/CrudBusinessDataService';
import {CrudSupervisedEntitiesService} from '@ofServices/admin/CrudSupervisedEntitiesService';

@Injectable()
export class SharingService implements OnDestroy {
    private readonly _paginationPageSize$: ReplaySubject<number>;
    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    private readonly crudUserService: CrudUserService;
    private readonly crudEntitiesService: CrudEntitiesService;
    private readonly crudGroupsService: CrudGroupsService;
    private readonly crudPerimetersService: CrudPerimetersService;
    private readonly crudProcessesService: CrudProcessesService;
    private readonly crudBusinessDataService: CrudBusinessDataService;
    private readonly supervisedEntitiesService: CrudSupervisedEntitiesService;

    constructor() {
        this._paginationPageSize$ = new ReplaySubject<number>();
        this.crudUserService = new CrudUserService();
        this.crudEntitiesService = new CrudEntitiesService();
        this.crudGroupsService = new CrudGroupsService();
        this.crudPerimetersService = new CrudPerimetersService();
        this.crudProcessesService = new CrudProcessesService();
        this.crudBusinessDataService = new CrudBusinessDataService();
        this.supervisedEntitiesService = new CrudSupervisedEntitiesService();

        // Initialization necessary for perimeters selection dropdown in modals and to display names instead of codes
        // As it is only necessary for admin purposes, it's done here rather than in the app initialization code
        PerimetersService.loadAllPerimetersData().pipe(takeUntil(this.unsubscribe$)).subscribe();
    }

    /** This is a factory method returning the appropriate `CrudService` depending on the type passed as parameter.
     * */
    public resolveCrudServiceDependingOnType(adminItemType: AdminItemType): CrudService {
        switch (adminItemType) {
            case AdminItemType.ENTITY:
                return this.crudEntitiesService;
            case AdminItemType.GROUP:
                return this.crudGroupsService;
            case AdminItemType.USER:
                return this.crudUserService;
            case AdminItemType.PERIMETER:
                return this.crudPerimetersService;
            case AdminItemType.PROCESS:
                return this.crudProcessesService;
            case AdminItemType.BUSINESSDATA:
                return this.crudBusinessDataService;
            case AdminItemType.SUPERVISED_ENTITY:
                return this.supervisedEntitiesService;
            default:
                throw Error('No CrudService associated with ' + adminItemType);
        }
    }

    get paginationPageSize$(): Observable<number> {
        return this._paginationPageSize$;
    }

    changePaginationPageSize(value: number) {
        this._paginationPageSize$.next(value);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

/** This enum defines the type of the data managed by an admin table or renderer. When adding a type to this list, please make sure
 * to also add the corresponding handling to the methods above.
 **/

export enum AdminItemType {
    USER = 'user',
    ENTITY = 'entity',
    GROUP = 'group',
    PERIMETER = 'perimeter',
    PROCESS = 'process',
    BUSINESSDATA = 'businessData',
    SUPERVISED_ENTITY = 'supervisedEntity'
}
