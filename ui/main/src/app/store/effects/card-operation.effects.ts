/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {CardService} from '@ofServices/card.service';
import {EMPTY, Observable} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {
    LightCardActionTypes,RemoveLightCard, SelectLightCard
} from '@ofActions/light-card.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectCardStateSelectedId} from '@ofSelectors/card.selectors';
import {AppService} from '@ofServices/app.service';


@Injectable()
export class CardOperationEffects {

 
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private cardService: CardService,
                private appService: AppService) {
    }


    deleteIfSelectedCard: Observable<any> = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.RemoveLightCard),
            map((a: RemoveLightCard) => a.payload.card),
            withLatestFrom(this.store.select(selectCardStateSelectedId)), // retrieve currently selected card
            switchMap(([card, selectedCardId]) =>  {
                if (card === selectedCardId)
                    this.appService.closeDetails();
                return EMPTY;
            })
        ), { dispatch: false });

    setSelectedCard: Observable<any> = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.SelectLightCard),
            map((a: SelectLightCard) => this.cardService.setSelectedCard(a.payload.selectedCardId))
        ), { dispatch: false });

}
