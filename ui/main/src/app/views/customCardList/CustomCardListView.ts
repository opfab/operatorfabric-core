/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {CustomScreenDefinition, HeaderFilter} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {ResultTable} from './ResultTable';
import {OpfabStore} from '@ofStore/opfabStore';
import {Observable, ReplaySubject, Subject, combineLatest, map, takeUntil} from 'rxjs';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {UsersService} from '@ofServices/users/UsersService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';

export class CustomCardListView {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly resultTable: ResultTable;
    private results: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();
    filter$: Subject<void> = new ReplaySubject<void>(1);

    constructor(id: string) {
        this.customScreenDefinition = CustomScreenService.getCustomScreenDefinition(id);
        this.resultTable = new ResultTable(this.customScreenDefinition);
        this.resultTable.setBusinessDateFilter(
            RealTimeDomainService.getCurrentDomain().startDate,
            RealTimeDomainService.getCurrentDomain().endDate
        );
        this.filter$.next();
    }

    public isCustomScreenDefinitionExist(): boolean {
        return this.customScreenDefinition !== undefined;
    }

    public getColumnsDefinitionForAgGrid(): any[] {
        return this.resultTable.getColumnsDefinitionForAgGrid();
    }

    public getResults(): Observable<any> {
        return combineLatest([OpfabStore.getLightCardStore().getLightCards(), this.filter$]).pipe(
            takeUntil(this.unsubscribe$),
            map((result) => {
                this.results = this.resultTable.getDataArrayFromCards(
                    result[0],
                    OpfabStore.getLightCardStore().getAllChildCards()
                );
                return this.results;
            })
        );
    }

    public setBusinessPeriod(startDate: number, endDate: number) {
        RealTimeDomainService.setStartAndEndPeriod(startDate, endDate);
        RealTimeDomainService.saveUserPreferenceAsNearestDomain();
        this.resultTable.setBusinessDateFilter(startDate, endDate);
    }

    public search() {
        this.filter$.next();
    }

    public getBusinessPeriod(): {startDate: number; endDate: number} {
        return RealTimeDomainService.getCurrentDomain();
    }

    public getDataForExport(): Array<any> {
        const result = [];
        this.results.forEach((line) => {
            const row = {};
            this.resultTable.getColumnsDefinitionForAgGrid().forEach((column) => {
                let cellValue = line[column.field];
                if (cellValue?.text) cellValue = cellValue.text;
                row[column.headerName] = cellValue;
            });
            result.push(row);
        });
        result.push();

        return result;
    }

    public isFilterVisibleInHeader(filter: HeaderFilter): boolean {
        return this.customScreenDefinition.headerFilters?.includes(filter);
    }

    public setProcessList(processIds: string[]) {
        this.resultTable.setProcessFilter(processIds);
    }

    public setTypesOfStateFilter(typesOfState: string[]) {
        this.resultTable.setTypesOfStateFilter(typesOfState);
    }

    public getProcessList(): {id: string; label: string}[] {
        const perimeters = UsersService.getCurrentUserWithPerimeters().computedPerimeters;

        const processes = new Map();
        perimeters.forEach((perimeter) => {
            const process = ProcessesService.getProcess(perimeter.process);
            if (process && !processes.has(process.id)) processes.set(process.id, {id: process.id, label: process.name});
        });

        return Array.from(processes.values());
    }

    public destroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
