/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {catchError, filter, map, takeUntil} from 'rxjs/operators';
import {LightCard} from '@ofModel/light-card.model';
import * as moment from 'moment';
import {I18n} from '@ofModel/i18n.model';
import {MonitoringFiltersComponent} from './components/monitoring-filters/monitoring-filters.component';
import {Process, TypeOfStateEnum} from '@ofModel/processes.model';
import {ProcessesService} from '@ofServices/processes.service';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {Filter} from '@ofModel/feed-filter.model';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {EntitiesService} from '@ofServices/entities.service';

@Component({
    selector: 'of-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss']
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
    processValueForFilter = new Array();

    result: LineOfMonitoringResult[];

    loadingInProgress = false;

    isThereProcessStateToDisplay: boolean;

    constructor(private processesService: ProcessesService
                , private lightCardsService: LightCardsFeedFilterService
                , private lightCardsStoreService: LightCardsStoreService
                , private entitiesService: EntitiesService
    ) {

         processesService.getAllProcesses().forEach(process => {
            const id = process.id;
            if (!!process.uiVisibility && !!process.uiVisibility.monitoring) {
                this.mapOfProcesses.set(id, process);
                let itemName = process.name;
                if (!itemName)
                    itemName = id;
                this.processValueForFilter.push({id: id, itemName: itemName, i18nPrefix: `${process.id}.${process.version}` });
            }
         });

    }

    ngOnInit() {
        this.monitoringResult$ = 
            combineLatest([
                this.monitoringFilters$.asObservable(),
                this.responseFilter$.asObservable(),
                this.lightCardsStoreService.getLightCards()
            ]
            ).pipe(
                takeUntil(this.unsubscribe$),
                // the filters are set   by the monitoring filter and by the time line 
                // so it generates two events , we need to wait until every filter is set 
                filter( results => this.areFiltersCorrectlySet(results[0])),  
                map(results => {
                        const activeFilters = results[0].concat(results[1]);
                        const cards = results[2].filter(card => Filter.chainFilter(card,activeFilters));
                        if (!!cards && cards.length <= 0) {
                            return null;
                        }
                        return cards.map(card => {
                                return this.cardToResult(card)
                            }
                        ).filter(elem => !!elem)
                         .sort(( card1,card2) => (card2.creationDateTime.valueOf() - card1.creationDateTime.valueOf()));
                    }
                ),
                catchError(err => of([]))
        );
        this.monitoringResult$.subscribe(lines => this.result = lines);
        this.applyResponseFilter();
        this.lightCardsStoreService.getLoadingInProgress().pipe(
            takeUntil(this.unsubscribe$)).subscribe( (inProgress: boolean ) => this.loadingInProgress = inProgress);
        this.isThereProcessStateToDisplay = this.processesService.getStatesListPerProcess(false).size > 0;
    }

    private areFiltersCorrectlySet(filters:Array<any>): boolean
    {
        let correctlySet:boolean = true;
        filters.forEach( filter => {if (!filter) correctlySet =false;});
        return correctlySet;
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

    private getEmitter(card: LightCard) : string {
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = (isThirdPartyPublisher) ? card.publisher : this.entitiesService.getEntityName(card.publisher);

        let representative = '';

        if (!!card.representativeType && !!card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = (isThirdPartyRepresentative) ? card.representative : this.entitiesService.getEntityName(card.representative);
        }
        return !representative.length ? sender : (sender + ' (' + representative + ')');
    }

    private getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards(card: LightCard) {
        let entityIdsAllowedOrRequiredToRespond = [];
        if (card.entitiesAllowedToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(card.entitiesAllowedToRespond);
        if (card.entitiesRequiredToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(card.entitiesRequiredToRespond);

        const entitiesAllowedOrRequiredToRespond = this.entitiesService.getEntitiesFromIds(entityIdsAllowedOrRequiredToRespond);
 
        return this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedOrRequiredToRespond).map(entity => entity.id);
    }

    private getEntityIdsRequiredToRespondAndAllowedToSendCards(card: LightCard) {
        if (!card.entitiesRequiredToRespond) return [];
        const entitiesAllowedToRespond = this.entitiesService.getEntitiesFromIds(card.entitiesRequiredToRespond);
        return this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond).map(entity => entity.id);
    }

    private cardToResult(card: LightCard) : LineOfMonitoringResult{
        let typeOfState: TypeOfStateEnum;
        const procId = card.process;
        
        if (!!this.mapOfProcesses && this.mapOfProcesses.has(procId) && !card.parentCardId) {
            const currentProcess = this.mapOfProcesses.get(procId);
            /**
             * work around because Object.setPrototypeOf(currentProcess, Process.prototype);
             * can't be apply to currentProcess, for some reason.
             * and thus currentProcess.extractState(…) throws an error
             */
            const state = Process.prototype.extractState.call(currentProcess, card);

            if (!!state && !!state.type) {
                typeOfState = state.type;
            }
            if (!!state.type) {
                return (
                    {
                        creationDateTime: moment(card.publishDate),
                        beginningOfBusinessPeriod: moment(card.startDate),
                        endOfBusinessPeriod: ((!!card.endDate) ? moment(card.endDate) : null),
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
                        entitiesResponses: this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards(card)
                    } as LineOfMonitoringResult);
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
            new Filter(
                (card: LightCard) => !card.hasChildCardFromCurrentUserEntity,
                !this.responseFilterValue,
                null
            ));
    }
}
