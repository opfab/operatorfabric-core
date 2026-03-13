/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardOperation} from '@ofServices/events/model/CardOperation';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {filter, map, Observable, ReplaySubject, Subject} from 'rxjs';
import {OpfabEventStreamServer} from './server/OpfabEventStreamServer';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';

export class OpfabEventStreamService {
    private static opfabEventStreamServer: OpfabEventStreamServer;

    public static readonly initSubscription = new Subject<void>();
    public static readonly loadingInProgress = new ReplaySubject<boolean>();
    private static numberOfLoadingInProgress = 0;

    private static startOfLoadedPeriod: number;
    private static endOfLoadedPeriod: number;

    private static currentPeriod: {start: number; end: number};

    private static readonly receivedDisconnectedSubject = new Subject<boolean>();
    private static readonly reloadRequest = new Subject<void>();
    private static readonly businessConfigChange = new Subject<void>();
    private static readonly userConfigChange = new Subject<void>();
    private static readonly userSettingsChange = new Subject<void>();
    private static readonly businessDataChange = new Subject<void>();
    private static readonly processMonitoringConfigChange = new Subject<void>();
    private static readonly uiMenuConfigChange = new Subject<void>();

    private static eventStreamClosed = false;

    public static setEventStreamServer(opfabEventStreamServer: OpfabEventStreamServer) {
        OpfabEventStreamService.opfabEventStreamServer = opfabEventStreamServer;
    }

    public static initEventStream(processStatesAlwaysLoaded: string[]) {
        OpfabEventStreamService.opfabEventStreamServer.initStream(processStatesAlwaysLoaded);
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
                    case 'OLD_CARDS_LOADING_END':
                        logger.info(`EventStreamService - OLD_CARDS_LOADING_END received`, LogOption.LOCAL_AND_REMOTE);
                        OpfabEventStreamService.removeALoadingInProgress();
                        break;
                    case 'BUSINESS_CONFIG_CHANGE':
                        OpfabEventStreamService.businessConfigChange.next();
                        logger.info(`EventStreamService - BUSINESS_CONFIG_CHANGE received`);
                        break;
                    case 'PROCESSMONITORING_CONFIG_CHANGE':
                        OpfabEventStreamService.processMonitoringConfigChange.next();
                        logger.info(`EventStreamService - PROCESSMONITORING_CONFIG_CHANGE received`);
                        break;
                    case 'UIMENU_CONFIG_CHANGE':
                        OpfabEventStreamService.uiMenuConfigChange.next();
                        logger.info(`EventStreamService - UIMENU_CONFIG_CHANGE received`);
                        break;
                    case 'USER_CONFIG_CHANGE':
                        OpfabEventStreamService.userConfigChange.next();
                        logger.info(`EventStreamService - USER_CONFIG_CHANGE received`);
                        break;
                    case 'USER_SETTINGS_CHANGE':
                        OpfabEventStreamService.userSettingsChange.next();
                        logger.info(`EventStreamService - USER_SETTINGS_CHANGE received`);
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
        OpfabEventStreamService.startOfLoadedPeriod = null;
        OpfabEventStreamService.endOfLoadedPeriod = null;
        OpfabEventStreamService.currentPeriod = null;
    }

    public static setSubscriptionDates(start: number, end: number) {
        if (
            start === OpfabEventStreamService.currentPeriod?.start &&
            end === OpfabEventStreamService.currentPeriod?.end
        ) {
            logger.info('EventStreamService - Same period, no need to reload cards', LogOption.LOCAL_AND_REMOTE);
            return;
        }
        OpfabEventStreamService.currentPeriod = {start, end};
        logger.info(
            'EventStreamService - Set subscription date' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        if (!OpfabEventStreamService.startOfLoadedPeriod) {
            // First loading , no card loaded yet
            OpfabEventStreamService.askCardsForPeriod(start, end);
            return;
        }
        if (start < OpfabEventStreamService.startOfLoadedPeriod && end > OpfabEventStreamService.endOfLoadedPeriod) {
            OpfabEventStreamService.askCardsForPeriod(start, end);
            return;
        }
        if (start < OpfabEventStreamService.startOfLoadedPeriod) {
            OpfabEventStreamService.askCardsForPeriod(start, OpfabEventStreamService.startOfLoadedPeriod);
            return;
        }
        if (end > OpfabEventStreamService.endOfLoadedPeriod) {
            OpfabEventStreamService.askCardsForPeriod(OpfabEventStreamService.endOfLoadedPeriod, end);
            return;
        }
        logger.info('EventStreamService - Card already loaded for the chosen period', LogOption.LOCAL_AND_REMOTE);
    }

    private static askCardsForPeriod(start: number, end: number) {
        logger.info(
            'EventStreamService - Need to load card for period ' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE
        );
        OpfabEventStreamService.addALoadingInProgress();

        // We set the period as loaded before asking cards to avoid asking several time the same period
        // It can happen when user change quickly the period with a bad network for example,
        // or when internal state switch period to a new one before receiving the response of the previous one.
        if (!OpfabEventStreamService.startOfLoadedPeriod || start < OpfabEventStreamService.startOfLoadedPeriod)
            OpfabEventStreamService.startOfLoadedPeriod = start;
        if (!OpfabEventStreamService.endOfLoadedPeriod || end > OpfabEventStreamService.endOfLoadedPeriod)
            OpfabEventStreamService.endOfLoadedPeriod = end;
        OpfabEventStreamService.opfabEventStreamServer
            .setBusinessPeriod(start, end)
            .subscribe((serverResponse: ServerResponse<any>) => {
                if (serverResponse.status === ServerResponseStatus.OK) {
                    logger.info(
                        'EventStreamService - Period set on backend for subscription ' +
                            new Date(start) +
                            ' -' +
                            new Date(end)
                    );
                } else {
                    logger.error(
                        'EventStreamService - Error while asking cards for period ' + serverResponse.statusMessage
                    );
                    OpfabEventStreamService.removeALoadingInProgress();
                    // Send a message to user to reload the application as we do not manage to set the period which is
                    // a critical error for the application to work properly, it is better to ask user
                    // to reload the application to try to recover a correct state
                    OpfabEventStreamService.reloadRequest.next();
                }
            });
    }

    private static addALoadingInProgress() {
        OpfabEventStreamService.numberOfLoadingInProgress++;
        if (OpfabEventStreamService.numberOfLoadingInProgress === 1)
            OpfabEventStreamService.loadingInProgress.next(true);
    }

    private static removeALoadingInProgress() {
        // It is possible that the loadingInProgress is already at 0 if the connection has been lost
        // and reopened so a reload of cards has been done without have been triggered in this class
        if (OpfabEventStreamService.numberOfLoadingInProgress === 0) return;
        OpfabEventStreamService.numberOfLoadingInProgress--;
        if (OpfabEventStreamService.numberOfLoadingInProgress === 0) {
            OpfabEventStreamService.loadingInProgress.next(false);
        }
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

    static getUserSettingsChangeRequests(): Observable<void> {
        return OpfabEventStreamService.userSettingsChange.asObservable();
    }

    static getProcessMonitoringConfigChangeRequests(): Observable<void> {
        return OpfabEventStreamService.processMonitoringConfigChange.asObservable();
    }

    static getUiMenuConfigChangeRequests(): Observable<void> {
        return OpfabEventStreamService.uiMenuConfigChange.asObservable();
    }

    static getLoadingInProgress(): Observable<boolean> {
        return OpfabEventStreamService.loadingInProgress.asObservable();
    }
}
