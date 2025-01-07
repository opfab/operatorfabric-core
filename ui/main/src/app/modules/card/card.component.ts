/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofServices/cards/model/Card';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {State} from '@ofServices/processes/model/Processes';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCard, SelectedCardStore} from 'app/business/store/selectedCard.store';
import {Router} from '@angular/router';
import {LoggerService} from 'app/services/logs/LoggerService';
import {ModalService} from '@ofServices/modal/ModalService';
import {I18n} from '@ofModel/i18n.model';
import {NgIf} from '@angular/common';
import {CardBodyComponent} from './components/card-body/card-body.component';
import {SpinnerComponent} from '../share/spinner/spinner.component';
import {TranslateModule} from '@ngx-translate/core';
import {ConfigService} from 'app/services/config/ConfigService';

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: true,
    imports: [NgIf, CardBodyComponent, SpinnerComponent, TranslateModule]
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
    detailClosed: boolean;
    hallwayMode: boolean;

    constructor(
        protected modalService: NgbModal,
        protected router: Router
    ) {
        this.hallwayMode = ConfigService.getConfigValue('settings.hallwayMode');
    }

    ngOnInit() {
        SelectedCardStore.getSelectedCard()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((selectedCard: SelectedCard) => {
                if (selectedCard.card) {
                    this.cardNotFound = false;
                    ProcessesService.queryProcess(
                        selectedCard.card.process,
                        selectedCard.card.processVersion
                    ).subscribe({
                        next: (businessconfig) => {
                            this.card = selectedCard.card;
                            this.childCards = selectedCard.childCards;
                            this.cardLoadingInProgress = false;
                            if (businessconfig) {
                                this.cardState = businessconfig.states.get(selectedCard.card.state);
                                if (!this.cardState) {
                                    LoggerService.warn(
                                        `State ${selectedCard.card.state} does not exist for process ${selectedCard.card.process}`
                                    );
                                    this.cardState = new State();
                                }
                            } else {
                                this.cardState = new State();
                            }
                        }
                    });
                } else if (selectedCard.notFound) {
                    this.cardNotFound = true;
                    this.cardLoadingInProgress = false;
                    LoggerService.warn('Card not found.');
                }
            });
        this.checkForCardLoadingInProgressForMoreThanOneSecond();
        this.checkForCardDeleted();
    }

    // we show a spinner on screen if card loading takes more than 1 second
    checkForCardLoadingInProgressForMoreThanOneSecond() {
        SelectedCardStore.getSelectCardIdChanges()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cardId) => {
                // a new card has been selected and will be downloaded
                //this.cardNotFound = false;
                this.currentSelectedCardId = cardId;
                setTimeout(() => {
                    if (SelectedCardStore.isSelectedCardNotFound()) {
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

    checkForCardDeleted() {
        SelectedCardStore.getSelectedCardsDeleted()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cardId) => {
                if (this.hallwayMode) this.closeDeletedCard();
                else {
                    setTimeout(() => {
                        if (!this.detailClosed) {
                            ModalService.openInformationModal(new I18n('feed.selectedCardDeleted')).then(() => {
                                this.closeDeletedCard();
                            });
                        }
                    }, 500);
                }
            });
    }

    closeDeletedCard() {
        this.detailClosed = true;
        if (this.parentModalRef) {
            this.parentModalRef.close();
            SelectedCardStore.clearSelectedCardId();
        } else {
            SelectedCardStore.clearSelectedCardId();
            if (!this.hallwayMode) this.router.navigate(['/feed']);
        }
    }

    closeDetails() {
        this.detailClosed = true;
    }

    public isSmallscreen() {
        return window.innerWidth < 1000;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
