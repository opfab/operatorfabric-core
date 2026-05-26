/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {ResultTable} from './resultTable/ResultTable';
import {OpfabStore} from '@ofStore/OpfabStore';
import {Observable, ReplaySubject, Subject, combineLatest, map, takeUntil} from 'rxjs';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {UsersService} from '@ofServices/users/UsersService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {LoggerService} from '@ofServices/logs/LoggerService';
import {ButtonActions} from './buttonActions/ButtonActions';
import {FilterValues} from '../../../services/customScreen/cardList/FilterValues';
import {getColumnsDefinitionForAgGrid} from './resultTable/ColumnDefinitions';
import {CardListScreenDefinition, HeaderFilter} from '@ofServices/customScreen/cardList/CardListScreenDefinition';
import {BusinessPeriodInitState} from '../../customScreen/BusinessPeriodInitState';

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
 * Everything is configured via the CardListScreenDefinition, which is loaded on startup and accessible via the CustomScreenService.
 **/

export class CustomCardListView {
    private readonly cardListScreenDefinition: CardListScreenDefinition;
    private readonly resultTable: ResultTable;
    private readonly buttonActions: ButtonActions;
    private results: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();
    filter$: Subject<void> = new ReplaySubject<void>(1);

    constructor(id: string) {
        this.cardListScreenDefinition = CustomScreenService.getCustomScreenDefinition(id) as CardListScreenDefinition;
        this.resultTable = new ResultTable(this.cardListScreenDefinition);
        this.buttonActions = new ButtonActions(this.cardListScreenDefinition);
        const filterValues = new FilterValues();

        if (this.cardListScreenDefinition?.initialBusinessPeriod === 'FROM_TODAY_TO_YEAR_END') {
            // FROM_TODAY_TO_YEAR_END is applied only once per page load.
            // A shared in-memory static variable (not screen-specific) is used so that once the user
            // changes the period in any dashboard or custom card list screen, this initial period
            // will not be re-applied when opening any of these screens again.
            // The state is automatically reset on every page reload (F5).
            if (BusinessPeriodInitState.fromTodayToYearEndDeactivated) {
                filterValues.startDate = RealTimeDomainService.getCurrentDomain()?.startDate;
                filterValues.endDate = RealTimeDomainService.getCurrentDomain()?.endDate;
            } else {
                const now = new Date();
                const currentYear = now.getFullYear();
                filterValues.startDate = new Date(currentYear, now.getMonth(), now.getDate()).getTime();
                filterValues.endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999).getTime();
                BusinessPeriodInitState.deactivate();
            }
        } else {
            filterValues.startDate = RealTimeDomainService.getCurrentDomain()?.startDate;
            filterValues.endDate = RealTimeDomainService.getCurrentDomain()?.endDate;
        }

        this.setFilters(filterValues);
        this.filter$.next();
    }

    public isCardListScreenDefinitionExist(): boolean {
        return this.cardListScreenDefinition !== undefined;
    }

    public getColumnsDefinitionForAgGrid(): any[] {
        return getColumnsDefinitionForAgGrid(this.cardListScreenDefinition);
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
        return this.cardListScreenDefinition.headerFilters?.includes(filter);
    }

    public shouldShowBackButton(): boolean {
        return this.cardListScreenDefinition?.showBackButton === true;
    }

    private getProcessList(processIds: string[]): string[] {
        if (processIds?.length > 0 || !this.cardListScreenDefinition) return processIds;
        return this.cardListScreenDefinition.processIds ?? [];
    }

    public getAllProcessesListAvailableForUser(): {id: string; label: string}[] {
        const perimeters = UsersService.getCurrentUserWithPerimeters()?.computedPerimeters ?? [];
        const processes = new Map();
        perimeters.forEach((perimeter) => {
            const process = ProcessesService.getProcess(perimeter.process);
            if (process && this.isProcessIdInTheListOfCardListScreenDefinition(process.id)) {
                processes.set(process.id, {id: process.id, label: process.name});
            }
        });

        return Array.from(processes.values());
    }

    public getDefaultSelectedTypeOfState(): string[] {
        return this.cardListScreenDefinition?.defaultSelectedTypeOfState ?? [];
    }

    public getDefaultSelectedReadAndAck(): string[] {
        return this.cardListScreenDefinition?.defaultSelectedReadAndAck ?? [];
    }

    private isProcessIdInTheListOfCardListScreenDefinition(processId: string): boolean {
        return (
            !this.cardListScreenDefinition?.processIds ||
            this.cardListScreenDefinition.processIds?.length === 0 ||
            this.cardListScreenDefinition.processIds.includes(processId)
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
