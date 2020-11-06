/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { LightCard } from '@ofModel/light-card.model';
import { CardService } from '@ofServices/card.service';
import { ProcessesService } from '@ofServices/processes.service';
import { UpdateALightCard } from '@ofStore/actions/light-card.actions';
import { AppState } from '@ofStore/index';
import { fetchLightCard, selectLastCards } from '@ofStore/selectors/feed.selectors';
import { take } from 'rxjs/operators';
import { ReminderList } from './reminderList';

@Injectable()
export class ReminderService {

    private reminderList: ReminderList ;

    constructor(private store: Store<AppState>, private processService: ProcessesService, private cardService: CardService) {
    }


    public startService(userLogin: string) {
        console.log(new Date().toISOString(), ' Reminder : starting service');
        this.reminderList = new ReminderList(userLogin);
        this.listenForCardsToAddInReminder();
        this.checkForCardToRemind();
    }

    private checkForCardToRemind() {
        let cardsIdToRemind = this.reminderList.getCardIdsToRemindNow();
        cardsIdToRemind.forEach(cardId => this.remindCard(cardId));
        setTimeout(() => this.checkForCardToRemind(), 5000);
        cardsIdToRemind = null;
    }

    private remindCard(cardId) {
        console.log(new Date().toISOString(), ' Reminder : will remind card = ', cardId);
        this.removeAcknowledgementAndRead(cardId);
        this.reminderList.setCardHasBeenRemind(cardId);
    }

    private listenForCardsToAddInReminder() {
        this.store.pipe(
            select(selectLastCards))
            .subscribe(cards => cards.forEach(card => {
                this.processService.queryProcessFromCard(card).subscribe(process => {
                    if (!!process) {
                        const state = process.states[card.state];
                        if (!!state) {
                            const secondsBeforeRemind = state.secondsBeforeTimeSpanForReminder;
                            if (!!secondsBeforeRemind) {
                                console.log(new Date().toISOString(), ' Reminder : add a reminder for card ', card.id);
                                this.reminderList.addAReminder(card, secondsBeforeRemind);
                            }
                        }
                    }
                }, () =>  console.log (new Date().toISOString(), ' Reminder : impossible to load process definition ' ,
                                                                card.process , ' with version ' , card.processVersion));
            }));
    }


    removeAcknowledgementAndRead(cardId) {
        this.store.select(fetchLightCard(cardId)).pipe(take(1))
            .subscribe((lightCard: LightCard) => {
                this.cardService.deleteUserAcknowledgement(lightCard.uid).subscribe(resp => {
                    if (!((resp.status === 200 || resp.status === 204)))
                         console.error(new Date().toISOString(),
                          'Reminder : the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    }
                );
                this.cardService.deleteUserCardRead(lightCard.uid).subscribe(resp => {
                    if (!((resp.status === 200 || resp.status === 204)))
                         console.error(new Date().toISOString(),
                          'Reminder : the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    }
                );
                const updatedLightCard = {...lightCard, hasBeenAcknowledged: false , hasBeenRead: false};
                this.store.dispatch(new UpdateALightCard({card: updatedLightCard}));
            });
    }


}

