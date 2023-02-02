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
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {
    CardActionTypes,
    LoadCardAction
} from '@ofActions/card.actions';
import {SelectedCardService} from 'app/business/services/selectedCard.service';

@Injectable()
export class CardEffects {
    constructor(
        private actions$: Actions,
        private service: CardService,
        private selectedCardService: SelectedCardService
    ) {}

    loadById: Observable<any> = createEffect(() =>
        this.actions$.pipe(
            ofType<LoadCardAction>(CardActionTypes.LoadCard),
            switchMap((action) => this.service.loadCard(action.payload.id)),
            map((cardData) => {
                this.selectedCardService.setSelectedCardWithChildren(cardData.card, cardData.childCards);
                return EMPTY;
            }),
            catchError((err, caught) => {
                this.selectedCardService.setSelectedCardId(null);
                this.selectedCardService.setSelectedCardWithChildren(null,null);
                this.selectedCardService.setSelectedCardNotFound();
                return caught;
            })
        ),
        {dispatch: false}
    );

}
