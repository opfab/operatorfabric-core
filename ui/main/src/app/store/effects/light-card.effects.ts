/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {catchError, delay, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {
    AddThirdActions,
    DelayedLightCardUpdate,
    LightCardActionTypes,
    LightCardAlreadyUpdated,
    LoadLightCardsFailure,
    ThirdActionAlreadyLoaded,
    ThirdActionAlreadyUpdated,
    UpdateALightCard,
    UpdateAnAction,
    UpdateAnActionFailure
} from "@ofActions/light-card.actions";
import {ThirdsService} from "@ofServices/thirds.service";
import {LightCard} from "@ofModel/light-card.model";
import {fetchLightCard} from "@ofSelectors/feed.selectors";
import {CardActionTypes, LoadCard} from "@ofActions/card.actions";
import {Action as ThirdAction, ActionStatus, extractActionStatusFromPseudoActionStatus} from "@ofModel/thirds.model";
import * as _ from 'lodash';

@Injectable()
export class LightCardEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private thirdService: ThirdsService
    ) {
    }

    @Effect()
    updateThirdActions: Observable<Action> = this.actions$
        .pipe(
            ofType<AddThirdActions>(LightCardActionTypes.AddThirdActions),
            map((action: AddThirdActions) => {
                const updateCard = {
                    ...(action.payload.card),
                    actions: action.payload.actions
                };
                return new UpdateALightCard({card: updateCard});
            })
        );

    @Effect()
    updateAThirdAction: Observable<Action> = this.actions$
        .pipe(
            ofType<UpdateAnAction>(LightCardActionTypes.UpdateAnAction),
            switchMap((action: UpdateAnAction) => {
                const lightCardId = action.payload.cardId;
                const thirdActionKey = action.payload.actionKey;
                const thirdActionStatus = extractActionStatusFromPseudoActionStatus(action.payload.status);
                return this.store.select(fetchLightCard(lightCardId)).pipe(
                    map((card: LightCard) => {
                        const thirdActions = card.actions;
                        if (thirdActions) {
                            const thirdActionToUpdate = thirdActions.get(thirdActionKey);
                            const st = extractActionStatusFromPseudoActionStatus(thirdActionToUpdate as ActionStatus);
                            if (_.isEqual(thirdActionStatus, st)) {
                                return new ThirdActionAlreadyUpdated();
                            } else {
                                const actualizedAction = {...thirdActionToUpdate, ...thirdActionStatus};
                                thirdActions.set(thirdActionKey, actualizedAction);
                                const updateCard = {
                                    ...card,
                                    actions: thirdActions
                                };
                                return new UpdateALightCard({card: updateCard})
                            }

                        } else {
                            console.log(`no actions for ${card.id}`, card);
                            return new UpdateAnActionFailure();
                        }
                    })
                );
            })
        );

    @Effect()
    uploadActions: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadCard>(CardActionTypes.LoadCard),
            switchMap(action => {
                const lightCardId = action.payload.id;
                return this.store.select(fetchLightCard(lightCardId))
            }),
            switchMap((lightCard: LightCard) => {
                if (!lightCard) return of(new LoadLightCardsFailure({error: new Error("Light card not loaded in the store yet")}));
                if (lightCard.actions) {
                    return of(new ThirdActionAlreadyLoaded());
                }
                return this.thirdService.fetchActionMapFromLightCard(lightCard)
                    .pipe(map((actions: Map<string, ThirdAction>) => {
                        return new AddThirdActions({card: lightCard, actions: actions}) as Action
                    }));
            })
            , catchError((error, caught) => {
                if (error.status && error.status == 404) {
                    console.log(`no actions available`);
                } else {
                    console.log(error);
                }
                return caught;
            })
        );
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
