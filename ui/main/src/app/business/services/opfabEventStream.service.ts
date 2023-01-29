/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {CardOperation} from '@ofModel/card-operation.model';
import {FilterService} from '@ofServices/lightcards/filter.service';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {
    CardSubscriptionOpenAction,
    CardSubscriptionClosedAction
} from '@ofStore/actions/cards-subscription.actions';
import {BusinessConfigChangeAction} from '@ofStore/actions/processes.actions';
import {UserConfigChangeAction} from '@ofStore/actions/user.actions';
import {AppState} from '@ofStore/index';
import {filter, map, Observable, Subject} from 'rxjs';
import {OpfabEventStreamServer} from '../server/opfabEventStream.server';

@Injectable({
    providedIn: 'root'
})
export class OpfabEventStreamService {
    public initSubscription = new Subject<void>();

    private startOfAlreadyLoadedPeriod: number;
    private endOfAlreadyLoadedPeriod: number;

    private receivedDisconnectedSubject = new Subject<boolean>();
    private reloadRequest = new Subject<void>();

    private eventStreamClosed = false;

    constructor(
        private opfabEventStreamServer: OpfabEventStreamServer,
        private store: Store<AppState>,
        private filterService: FilterService,
        private logger: OpfabLoggerService
    ) {}

    public initEventStream() {
        this.opfabEventStreamServer.getStreamStatus().subscribe((status) => {
            if (status === 'open') this.store.dispatch(new CardSubscriptionOpenAction());
            else this.store.dispatch(new CardSubscriptionClosedAction());
        });
        this.opfabEventStreamServer.initStream();
        this.listenForFilterChange();
    }

    private listenForFilterChange() {
        this.filterService.getBusinessDateFilterChanges().subscribe((filter) => {
            this.setSubscriptionDates(filter.status.start, filter.status.end);
        });
    }

    public closeEventStream() {
        if (!this.eventStreamClosed) {
            this.logger.info('EventStreamService - Closing event stream', LogOption.LOCAL_AND_REMOTE);
            this.opfabEventStreamServer.closeStream();
            this.eventStreamClosed = true;
        }
    }

    public getCardOperationStream(): Observable<CardOperation> {
        return this.opfabEventStreamServer.getEvents().pipe(
            map((event) => {
                switch (event.data) {
                    case 'RELOAD':
                        this.logger.info(`EventStreamService - RELOAD received`, LogOption.LOCAL_AND_REMOTE);
                        this.reloadRequest.next();
                        break;
                    case 'BUSINESS_CONFIG_CHANGE':
                        this.store.dispatch(new BusinessConfigChangeAction());
                        this.logger.info(`EventStreamService - BUSINESS_CONFIG_CHANGE received`);
                        break;
                    case 'USER_CONFIG_CHANGE':
                        this.store.dispatch(new UserConfigChangeAction());
                        this.logger.info(`EventStreamService - USER_CONFIG_CHANGE received`);
                        break;
                    case 'DISCONNECT_USER_DUE_TO_NEW_CONNECTION':
                        this.logger.info(
                            'EventStreamService - Disconnecting user because a new connection is being opened for this account'
                        );
                        this.closeEventStream();
                        this.receivedDisconnectedSubject.next(true);
                        break;
                    default:
                        let cardOperation;
                        try {
                            cardOperation = JSON.parse(event.data, CardOperation.convertTypeIntoEnum);
                        } catch (error) {
                            this.logger.warn('EventStreamService - Impossible to parse server message ' + error);
                        }
                        return cardOperation;
                }
                return null;
            }),
            filter((cardOperation) => cardOperation)
        );
    }

    public resetAlreadyLoadingPeriod() {
        this.startOfAlreadyLoadedPeriod = null;
    }

    private setSubscriptionDates(start: number, end: number) {
        this.logger.info(
            'EventStreamService - Set subscription date' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        if (!this.startOfAlreadyLoadedPeriod) {
            // First loading , no card loaded yet
            this.askCardsForPeriod(start, end);
            return;
        }
        if (start < this.startOfAlreadyLoadedPeriod && end > this.endOfAlreadyLoadedPeriod) {
            this.askCardsForPeriod(start, end);
            return;
        }
        if (start < this.startOfAlreadyLoadedPeriod) {
            this.askCardsForPeriod(start, this.startOfAlreadyLoadedPeriod);
            return;
        }
        if (end > this.endOfAlreadyLoadedPeriod) {
            this.askCardsForPeriod(this.endOfAlreadyLoadedPeriod, end);
            return;
        }
        this.logger.info('EventStreamService - Card already loaded for the chosen period', LogOption.LOCAL_AND_REMOTE);
    }

    private askCardsForPeriod(start: number, end: number) {
        this.logger.info(
            'EventStreamService - Need to load card for period ' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        this.opfabEventStreamServer.setBusinessPeriod(start, end).subscribe(() => {
            if (!this.startOfAlreadyLoadedPeriod || start < this.startOfAlreadyLoadedPeriod)
                this.startOfAlreadyLoadedPeriod = start;
            if (!this.endOfAlreadyLoadedPeriod || end > this.endOfAlreadyLoadedPeriod)
                this.endOfAlreadyLoadedPeriod = end;
        });
    }

    getReceivedDisconnectUser(): Observable<boolean> {
        return this.receivedDisconnectedSubject.asObservable();
    }

    getReloadRequest(): Observable<void> {
        return this.reloadRequest.asObservable();
    }
}
