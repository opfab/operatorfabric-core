/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardOperation} from '@ofModel/card-operation.model';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {filter, map, Observable, Subject} from 'rxjs';
import {OpfabEventStreamServer} from '../../server/opfabEventStream.server';

export class OpfabEventStreamService {
    private static opfabEventStreamServer: OpfabEventStreamServer;

    public static readonly initSubscription = new Subject<void>();

    private static startOfAlreadyLoadedPeriod: number;
    private static endOfAlreadyLoadedPeriod: number;

    private static currentPeriod: {start: number; end: number};

    private static readonly receivedDisconnectedSubject = new Subject<boolean>();
    private static readonly reloadRequest = new Subject<void>();
    private static readonly businessConfigChange = new Subject<void>();
    private static readonly userConfigChange = new Subject<void>();
    private static readonly businessDataChange = new Subject<void>();
    private static readonly monitoringConfigChange = new Subject<void>();

    private static eventStreamClosed = false;

    public static setEventStreamServer(opfabEventStreamServer: OpfabEventStreamServer) {
        OpfabEventStreamService.opfabEventStreamServer = opfabEventStreamServer;
    }

    public static initEventStream() {
        OpfabEventStreamService.opfabEventStreamServer.initStream();
    }

    public static closeEventStream() {
        if (OpfabEventStreamService.opfabEventStreamServer && !OpfabEventStreamService.eventStreamClosed) {
            logger.info('EventStreamService - Closing event stream', LogOption.LOCAL_AND_REMOTE);
            OpfabEventStreamService.opfabEventStreamServer.closeStream();
            OpfabEventStreamService.eventStreamClosed = true;
        }
    }

    public static getCardOperationStream(): Observable<CardOperation> {
        return OpfabEventStreamService.opfabEventStreamServer.getEvents().pipe(
            map((event) => {
                switch (event.data) {
                    case 'RELOAD':
                        logger.info(`EventStreamService - RELOAD received`, LogOption.LOCAL_AND_REMOTE);
                        OpfabEventStreamService.reloadRequest.next();
                        break;
                    case 'BUSINESS_CONFIG_CHANGE':
                        OpfabEventStreamService.businessConfigChange.next();
                        logger.info(`EventStreamService - BUSINESS_CONFIG_CHANGE received`);
                        break;
                    case 'MONITORING_CONFIG_CHANGE':
                        OpfabEventStreamService.monitoringConfigChange.next();
                        logger.info(`EventStreamService - MONITORING_CONFIG_CHANGE received`);
                        break;
                    case 'USER_CONFIG_CHANGE':
                        OpfabEventStreamService.userConfigChange.next();
                        logger.info(`EventStreamService - USER_CONFIG_CHANGE received`);
                        break;
                    case 'DISCONNECT_USER_DUE_TO_NEW_CONNECTION':
                        logger.info(
                            'EventStreamService - Disconnecting user because a new connection is being opened for this account'
                        );
                        OpfabEventStreamService.closeEventStream();
                        OpfabEventStreamService.receivedDisconnectedSubject.next(true);
                        break;
                    case 'BUSINESS_DATA_CHANGE':
                        OpfabEventStreamService.businessDataChange.next();
                        break;
                    default:
                        let cardOperation;
                        try {
                            cardOperation = JSON.parse(event.data, CardOperation.convertTypeIntoEnum);
                        } catch (error) {
                            logger.warn('EventStreamService - Impossible to parse server message ' + error);
                        }
                        return cardOperation;
                }
                return null;
            }),
            filter((cardOperation) => cardOperation)
        );
    }

    public static resetAlreadyLoadingPeriod() {
        OpfabEventStreamService.startOfAlreadyLoadedPeriod = null;
        OpfabEventStreamService.endOfAlreadyLoadedPeriod = null;
        OpfabEventStreamService.currentPeriod = null;
    }

    public static setSubscriptionDates(start: number, end: number) {
        if (
            OpfabEventStreamService.currentPeriod &&
            start === OpfabEventStreamService.currentPeriod.start &&
            end === OpfabEventStreamService.currentPeriod.end
        ) {
            logger.info('EventStreamService - Same period, no need to reload cards', LogOption.LOCAL_AND_REMOTE);
            return;
        }
        OpfabEventStreamService.currentPeriod = {start, end};
        logger.info(
            'EventStreamService - Set subscription date' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        if (!OpfabEventStreamService.startOfAlreadyLoadedPeriod) {
            // First loading , no card loaded yet
            OpfabEventStreamService.askCardsForPeriod(start, end);
            return;
        }
        if (
            start < OpfabEventStreamService.startOfAlreadyLoadedPeriod &&
            end > OpfabEventStreamService.endOfAlreadyLoadedPeriod
        ) {
            OpfabEventStreamService.askCardsForPeriod(start, end);
            return;
        }
        if (start < OpfabEventStreamService.startOfAlreadyLoadedPeriod) {
            OpfabEventStreamService.askCardsForPeriod(start, OpfabEventStreamService.startOfAlreadyLoadedPeriod);
            return;
        }
        if (end > OpfabEventStreamService.endOfAlreadyLoadedPeriod) {
            OpfabEventStreamService.askCardsForPeriod(OpfabEventStreamService.endOfAlreadyLoadedPeriod, end);
            return;
        }
        logger.info('EventStreamService - Card already loaded for the chosen period', LogOption.LOCAL_AND_REMOTE);
    }

    private static askCardsForPeriod(start: number, end: number) {
        logger.info(
            'EventStreamService - Need to load card for period ' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        OpfabEventStreamService.opfabEventStreamServer.setBusinessPeriod(start, end).subscribe(() => {
            if (
                !OpfabEventStreamService.startOfAlreadyLoadedPeriod ||
                start < OpfabEventStreamService.startOfAlreadyLoadedPeriod
            )
                OpfabEventStreamService.startOfAlreadyLoadedPeriod = start;
            if (
                !OpfabEventStreamService.endOfAlreadyLoadedPeriod ||
                end > OpfabEventStreamService.endOfAlreadyLoadedPeriod
            )
                OpfabEventStreamService.endOfAlreadyLoadedPeriod = end;
        });
    }

    static getReceivedDisconnectUser(): Observable<boolean> {
        return OpfabEventStreamService.receivedDisconnectedSubject.asObservable();
    }

    static getReloadRequests(): Observable<void> {
        return OpfabEventStreamService.reloadRequest.asObservable();
    }

    static getBusinessConfigChangeRequests(): Observable<void> {
        return OpfabEventStreamService.businessConfigChange.asObservable();
    }

    static getBusinessDataChanges(): Observable<void> {
        return OpfabEventStreamService.businessDataChange.asObservable();
    }

    static getUserConfigChangeRequests(): Observable<void> {
        return OpfabEventStreamService.userConfigChange.asObservable();
    }

    static getMonitoringConfigChangeRequests(): Observable<void> {
        return OpfabEventStreamService.monitoringConfigChange.asObservable();
    }
}
