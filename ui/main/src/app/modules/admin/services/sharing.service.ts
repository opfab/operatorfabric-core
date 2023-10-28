/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable, OnDestroy} from '@angular/core';
import {CrudService} from 'app/business/services/crud-service';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PerimetersService} from 'app/business/services/users/perimeters.service';
import {AdminProcessesService} from 'app/business/services/businessconfig/adminprocess.service';
import {BusinessDataService} from 'app/business/services/businessconfig/businessdata.service';
import {CrudUserService} from 'app/business/services/admin/crud-user.service';
import {CrudEntitiesService} from 'app/business/services/admin/crud-entities-service';
import {CrudGroupsService} from 'app/business/services/admin/crud-groups.service';


@Injectable()
export class SharingService implements OnDestroy {
    private readonly _paginationPageSize$: ReplaySubject<number>;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private crudUserService: CrudUserService;
    private crudEntitiesService: CrudEntitiesService;
    private crudGroupsService: CrudGroupsService;

    constructor(
        private perimetersService: PerimetersService,
        private businessDataService: BusinessDataService,
        private adminprocessesService: AdminProcessesService
    ) {
        this._paginationPageSize$ = new ReplaySubject<number>();
        this.crudUserService = new CrudUserService();
        this.crudEntitiesService = new CrudEntitiesService();
        this.crudGroupsService = new CrudGroupsService();


        // Initialization necessary for perimeters selection dropdown in modals and to display names instead of codes
        // As it is only necessary for admin purposes, it's done here rather than in the app initialization code
        this.perimetersService.loadAllPerimetersData().pipe(takeUntil(this.unsubscribe$)).subscribe();
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
                return this.perimetersService;
            case AdminItemType.PROCESS:
                return this.adminprocessesService;
            case AdminItemType.BUSINESSDATA:
                return this.businessDataService;
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
 * */
export enum AdminItemType {
    USER = 'user',
    ENTITY = 'entity',
    GROUP = 'group',
    PERIMETER = 'perimeter',
    PROCESS = 'process',
    BUSINESSDATA = 'businessData'
}
