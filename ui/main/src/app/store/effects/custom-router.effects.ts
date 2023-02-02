/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, Observable} from 'rxjs';
import {ROUTER_NAVIGATION, ROUTER_REQUEST, RouterNavigationAction, RouterRequestAction} from '@ngrx/router-store';
import {filter, map, switchMap} from 'rxjs/operators';
import {LoadCardAction} from '@ofActions/card.actions';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {SelectedCardService} from 'app/business/services/selectedCard.service';

@Injectable()
export class CustomRouterEffects {
    constructor(
        private actions$: Actions,
        private opfabLogger: OpfabLoggerService,
        private selectedCardService: SelectedCardService
    ) {}

    navigateToCard: Observable<any> = createEffect(() =>
        this.actions$.pipe(
            ofType(ROUTER_NAVIGATION),
            filter((action: RouterNavigationAction) => {
                return action.payload.event.url.indexOf('/feed/cards/') >= 0;
            }),
            switchMap((action) => {
                const routerState: any = action.payload.routerState;
                this.selectedCardService.setSelectedCardId(routerState.params['cid']);
                return [new LoadCardAction({id: routerState.params['cid']})];
            })
        )
    );

    navigateAwayFromFeed: Observable<any> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ROUTER_REQUEST),
                filter((action: RouterRequestAction) => {
                    return (
                        action.payload.routerState.url.indexOf('/feed/cards/') >= 0 &&
                        action.payload.event.url.indexOf('/feed/') < 0
                    ); //If navigating from /feed/cards/ to somewhere else
                }),
                map(() => {
                    this.selectedCardService.clearSelectedCardId();
                    return EMPTY;
                })
            ),
        {dispatch: false}
    );

    remoteLogNavigate: Observable<any> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ROUTER_NAVIGATION),
                map((action: RouterRequestAction) => {
                    this.opfabLogger.info('Navigate to ' + action.payload.event.url, LogOption.REMOTE);
                    return EMPTY;
                })
            ),
        {dispatch: false}
    );
}
