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
import {ResultTable} from './resultTable/ResultTable';
import {OpfabStore} from '@ofStore/OpfabStore';
import {Observable, ReplaySubject, Subject, combineLatest, map, takeUntil} from 'rxjs';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {UsersService} from '@ofServices/users/UsersService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {LoggerService} from '@ofServices/logs/LoggerService';
import {ButtonActions} from './buttonActions/ButtonActions';
import {FilterValues} from './FilterValues';

/**
 * This class is responsible for implementing the business logic related to the UI component.
 *
 * It retrieves data from the store and uses the ResultTable class to build the data array for display.
 * By subscribing to the store, it updates the data array when cards are updated.
 *
 * The ButtonActions class is used to execute user actions when buttons are clicked:
 *    - Send response for selected cards
 *    - Acknowledge selected cards
 *
 * Everything is configured via the CustomScreenDefinition, which is loaded on startup and accessible via the CustomScreenService.
 **/

export class CustomCardListView {
    private readonly customScreenDefinition: CustomScreenDefinition;
    private readonly resultTable: ResultTable;
    private readonly buttonActions: ButtonActions;
    private results: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();
    filter$: Subject<void> = new ReplaySubject<void>(1);

    constructor(id: string) {
        this.customScreenDefinition = CustomScreenService.getCustomScreenDefinition(id);
        this.resultTable = new ResultTable(this.customScreenDefinition);
        this.buttonActions = new ButtonActions(this.customScreenDefinition);
        const filterValues = new FilterValues();
        filterValues.startDate = RealTimeDomainService.getCurrentDomain()?.startDate;
        filterValues.endDate = RealTimeDomainService.getCurrentDomain()?.endDate;
        filterValues.processes = [];
        filterValues.includeCardsWithResponseFromMyEntities = true;
        filterValues.includeCardsWithResponsesFromAllEntities = true;
        this.setFilters(filterValues);
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
                const cards = result[0];
                const sortedCards = [...cards].sort((a, b) => b.publishDate - a.publishDate);
                const startTimer = Date.now();
                this.results = this.resultTable.getDataArrayFromCards(
                    sortedCards,
                    OpfabStore.getLightCardStore().getAllChildCards()
                );
                const endTimer = Date.now();
                LoggerService.info(`Custom card list - Time to process data: ${endTimer - startTimer}ms`);
                return this.results;
            })
        );
    }

    public setFilters(filterValues: FilterValues) {
        RealTimeDomainService.setStartAndEndPeriod(filterValues.startDate, filterValues.endDate);
        RealTimeDomainService.saveUserPreferenceAsNearestDomain();
        filterValues.processes = this.getProcessList(filterValues.processes);
        this.resultTable.setFilters(filterValues);
    }

    public search() {
        this.filter$.next();
    }

    public getBusinessPeriod(): {startDate: number; endDate: number} {
        return RealTimeDomainService.getCurrentDomain();
    }

    public getDataForExport(): Array<any> {
        return this.resultTable.getDataForExport();
    }

    public isFilterVisibleInHeader(filter: HeaderFilter): boolean {
        return this.customScreenDefinition.headerFilters?.includes(filter);
    }

    private getProcessList(processIds: string[]): string[] {
        if (processIds?.length > 0 || !this.customScreenDefinition) return processIds;
        return this.customScreenDefinition.processIds ?? [];
    }

    public getAllProcessesListAvailableForUser(): {id: string; label: string}[] {
        const perimeters = UsersService.getCurrentUserWithPerimeters()?.computedPerimeters ?? [];
        const processes = new Map();
        perimeters.forEach((perimeter) => {
            const process = ProcessesService.getProcess(perimeter.process);
            if (process && this.isProcessIdInTheListOfCustomScreenDefinition(process.id)) {
                processes.set(process.id, {id: process.id, label: process.name});
            }
        });

        return Array.from(processes.values());
    }

    public getDefaultSelectedTypeOfState(): string[] {
        return this.customScreenDefinition?.defaultSelectedTypeOfState ?? [];
    }

    private isProcessIdInTheListOfCustomScreenDefinition(processId: string): boolean {
        return (
            !this.customScreenDefinition?.processIds ||
            this.customScreenDefinition.processIds?.length === 0 ||
            this.customScreenDefinition.processIds.includes(processId)
        );
    }

    public getResponseButtons(): {id: string; label: string}[] {
        return this.buttonActions.getResponseButtons();
    }

    public async clickOnButton(buttonId: string, responsesData: Map<string, any>): Promise<boolean> {
        return await this.buttonActions.sendResponsesWhenUserClicksOnResponseButton(buttonId, responsesData);
    }

    public isAcknowledgmentButtonVisible(): boolean {
        return this.buttonActions.isAcknowledgmentButtonVisible();
    }

    public clickOnAcknowledgmentButton(cardIds: string[]) {
        this.buttonActions.sendAcknowledgments(cardIds);
    }

    public destroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
