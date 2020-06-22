/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {delay, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {
    DelayedLightCardUpdate,
    LightCardActionTypes,
    LightCardAlreadyUpdated,
    UpdateALightCard
} from "@ofActions/light-card.actions";
import {LightCard} from "@ofModel/light-card.model";
import {fetchLightCard} from "@ofSelectors/feed.selectors";
import * as _ from 'lodash';

@Injectable()
export class LightCardEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions
    ) {
    }

    @Effect()
    delayUpdateLightCard: Observable<Action> = this.actions$
        .pipe(
            ofType<DelayedLightCardUpdate>(LightCardActionTypes.DelayedLightCardUpdate),
            switchMap((action: DelayedLightCardUpdate) => {
                    const receivedCard = action.payload.card;
                    return this.store.select(fetchLightCard(receivedCard.id)).pipe(
                        map((storedCard: LightCard) => {
                            if (receivedCard === storedCard) {
                                return new LightCardAlreadyUpdated();
                            }
                            return new UpdateALightCard({card: action.payload.card})

                        })
                    );
                }
            ),
            delay(500)
        );
}
