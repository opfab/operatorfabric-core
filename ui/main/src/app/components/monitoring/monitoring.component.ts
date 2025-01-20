/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {LineOfMonitoringResult} from 'app/components/monitoring/model/LineOfMonitoringResult';
import {catchError, debounceTime, filter, map, takeUntil} from 'rxjs/operators';
import {LightCard} from 'app/model/LightCard';
import {I18n} from 'app/model/I18n';
import {MonitoringFiltersComponent} from './components/monitoring-filters/monitoring-filters.component';
import {Process, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Filter} from '@ofStore/lightcards/model/Filter';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {OpfabStore} from '../../store/opfabStore';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {MonitoringTableComponent} from './components/monitoring-table/monitoring-table.component';
import {UsersService} from '@ofServices/users/UsersService';

@Component({
    selector: 'of-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss'],
    standalone: true,
    imports: [TranslateModule, NgIf, MonitoringFiltersComponent, NgbPopover, MonitoringTableComponent]
})
export class MonitoringComponent implements OnInit, OnDestroy {
    @ViewChild('filters')
    filters: MonitoringFiltersComponent;

    monitoringFilters$ = new Subject<Filter[]>();

    responseFilter$ = new Subject<Filter>();
    responseFilterValue = true;

    monitoringResult$: Observable<LineOfMonitoringResult[]>;
    unsubscribe$: Subject<void> = new Subject<void>();

    mapOfProcesses = new Map<string, Process>();

    result: LineOfMonitoringResult[];

    loadingInProgress = false;

    isThereProcessStateToDisplay: boolean;
    selectedCardId: string;

    constructor() {
        ProcessesService.getAllProcesses().forEach((process) => {
            const id = process.id;
            if (process.uiVisibility?.monitoring) {
                this.mapOfProcesses.set(id, process);
            }
        });
    }

    ngOnInit() {
        this.monitoringResult$ = combineLatest([
            this.monitoringFilters$.asObservable(),
            this.responseFilter$.asObservable(),
            OpfabStore.getLightCardStore().getLightCards()
        ]).pipe(
            debounceTime(0), // Add this to avoid ExpressionChangedAfterItHasBeenCheckedError, so it waits for component init before processing
            takeUntil(this.unsubscribe$),
            // the filters are set   by the monitoring filter and by the timeline
            // so it generates two events , we need to wait until every filter is set
            filter((results) => this.areFiltersCorrectlySet(results[0])),
            map((results) => {
                const activeFilters = results[0].concat(results[1]);
                const cards = results[2].filter((card) => Filter.chainFilter(card, activeFilters));
                if (cards?.length === 0) {
                    return null;
                }
                return cards
                    .map((card) => {
                        return this.cardToResult(card);
                    })
                    .filter((elem) => !!elem)
                    .sort((card1, card2) => card2.creationDateTime.valueOf() - card1.creationDateTime.valueOf());
            }),
            catchError((err) => of([]))
        );
        this.monitoringResult$.subscribe((lines) => (this.result = lines));
        this.applyResponseFilter();
        OpfabStore.getLightCardStore()
            .getLoadingInProgress()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((inProgress: boolean) => (this.loadingInProgress = inProgress));
        this.isThereProcessStateToDisplay = this.hasStatesToDisplay();

        SelectedCardService.getSelectedCardIdChanges().subscribe(
            (selectedCardId) => (this.selectedCardId = selectedCardId)
        );
    }

    private areFiltersCorrectlySet(filters: Array<any>): boolean {
        let correctlySet = true;
        filters.forEach((filter) => {
            if (!filter) correctlySet = false;
        });
        return correctlySet;
    }

    private hasStatesToDisplay(): boolean {
        for (const process of ProcessesService.getAllProcesses()) {
            for (const [stateId] of process.states) {
                if (UsersService.isReceiveRightsForProcessAndState(process.id, stateId)) {
                    return true;
                }
            }
        }
        return false;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    prefixI18nKey(card: LightCard, key: string): I18n {
        const currentI18n = card[key] as I18n;
        return new I18n(this.prefixForTranslation(card, currentI18n.key), currentI18n.parameters);
    }

    prefixForTranslation(card: LightCard, key: string): string {
        return `${card.process}.${card.processVersion}.${key}`;
    }

    applyCardsFilters(filters: Filter[]) {
        this.monitoringFilters$.next(filters);
    }

    private getEmitter(card: LightCard): string {
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = isThirdPartyPublisher ? card.publisher : EntitiesService.getEntityName(card.publisher);

        let representative = '';

        if (card.representativeType && card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = isThirdPartyRepresentative
                ? card.representative
                : EntitiesService.getEntityName(card.representative);
        }
        return !representative.length ? sender : sender + ' (' + representative + ')';
    }

    private getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards(card: LightCard) {
        let entityIdsAllowedOrRequiredToRespond = [];
        if (card.entitiesAllowedToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                card.entitiesAllowedToRespond
            );
        if (card.entitiesRequiredToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                card.entitiesRequiredToRespond
            );

        const entitiesAllowedOrRequiredToRespond = EntitiesService.getEntitiesFromIds(
            entityIdsAllowedOrRequiredToRespond
        );

        return EntitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedOrRequiredToRespond).map(
            (entity) => entity.id
        );
    }

    private getEntityIdsRequiredToRespondAndAllowedToSendCards(card: LightCard) {
        if (!card.entitiesRequiredToRespond) return [];
        const entitiesAllowedToRespond = EntitiesService.getEntitiesFromIds(card.entitiesRequiredToRespond);
        return EntitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond).map((entity) => entity.id);
    }

    private cardToResult(card: LightCard): LineOfMonitoringResult {
        let typeOfState: TypeOfStateEnum;
        const procId = card.process;

        if (this.mapOfProcesses?.has(procId) && !card.parentCardId) {
            const currentProcess = this.mapOfProcesses.get(procId);

            const state = currentProcess.states.get(card.state);

            if (state?.type) {
                typeOfState = state.type;
                return {
                    creationDateTime: card.publishDate,
                    beginningOfBusinessPeriod: card.startDate,
                    endOfBusinessPeriod: card.endDate,
                    titleTranslated: card.titleTranslated,
                    summaryTranslated: card.summaryTranslated,
                    processName: currentProcess.name,
                    cardId: card.id,
                    cardUid: card.uid,
                    severity: card.severity.toLocaleLowerCase(),
                    processId: procId,
                    typeOfState: typeOfState,
                    answer: card.hasChildCardFromCurrentUserEntity,
                    emitter: this.getEmitter(card),
                    requiredResponses: this.getEntityIdsRequiredToRespondAndAllowedToSendCards(card),
                    allowedOrRequiredResponses: this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards(card)
                } as LineOfMonitoringResult;
            }
        }
        return null;
    }

    switchResponseFilter() {
        this.responseFilterValue = !this.responseFilterValue;
        this.applyResponseFilter();
    }

    private applyResponseFilter() {
        this.responseFilter$.next(
            new Filter((card: LightCard) => !card.hasChildCardFromCurrentUserEntity, !this.responseFilterValue, null)
        );
    }
}
