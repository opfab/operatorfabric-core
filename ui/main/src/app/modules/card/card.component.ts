/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from 'app/business/services/processes.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserService} from 'app/business/services/user.service';
import {AppService} from '@ofServices/app.service';
import {State} from '@ofModel/processes.model';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCard, SelectedCardService} from 'app/business/services/card/selectedCard.service';

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize = 'md';

    card: Card;
    childCards: Card[];
    cardState: State;
    unsubscribe$: Subject<void> = new Subject<void>();
    cardLoadingInProgress = false;
    cardNotFound = false;
    currentSelectedCardId: string;

    constructor(
        protected businessconfigService: ProcessesService,
        protected userService: UserService,
        protected selectedCardService: SelectedCardService,
        protected appService?: AppService
    ) {}

    ngOnInit() {
        this.selectedCardService
            .getSelectCard()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((selectedCard: SelectedCard) => {
                if (!!selectedCard.card) {
                    this.cardNotFound = false;
                    this.businessconfigService
                        .queryProcess(selectedCard.card.process, selectedCard.card.processVersion)
                        .subscribe({
                            next: (businessconfig) => {
                                this.card = selectedCard.card;
                                this.childCards = selectedCard.childCards;
                                this.cardLoadingInProgress = false;
                                if (!!businessconfig) {
                                    this.cardState = businessconfig.extractState(selectedCard.card);
                                    if (!this.cardState) {
                                        console.log(
                                            new Date().toISOString(),
                                            `WARNING state ${selectedCard.card.state} does not exist for process ${selectedCard.card.process}`
                                        );
                                        this.cardState = new State();
                                    }
                                } else {
                                    this.cardState = new State();
                                }
                            }
                        });
                } else {
                    if (selectedCard.notFound) {
                        this.cardNotFound = true;
                        this.cardLoadingInProgress = false;
                        console.log(new Date().toISOString(), 'WARNING card not found.');
                    }
                }
            });
        this.checkForCardLoadingInProgressForMoreThanOneSecond();
    }

    // we show a spinner on screen if card loading takes more than 1 second
    checkForCardLoadingInProgressForMoreThanOneSecond() {
        this.selectedCardService
            .getSelectCardIdChanges()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cardId) => {
                // a new card has been selected and will be downloaded
                //this.cardNotFound = false;
                this.currentSelectedCardId = cardId;
                setTimeout(() => {
                    if (this.selectedCardService.isSelectedCardNotFound()) {
                        this.cardLoadingInProgress = false;
                        return;
                    }
                    // the selected card has not changed in between
                    if (this.currentSelectedCardId === cardId) {
                        if (!this.card) this.cardLoadingInProgress = !!this.currentSelectedCardId;
                        else this.cardLoadingInProgress = this.card.id !== this.currentSelectedCardId;
                    }
                }, 1000);
            });
    }

    public isSmallscreen() {
        return window.innerWidth < 1000;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
