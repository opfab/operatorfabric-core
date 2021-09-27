/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as cardSelectors from '@ofStore/selectors/card.selectors';
import * as feedSelectors from '@ofStore/selectors/feed.selectors';
import {ProcessesService} from '@ofServices/processes.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserService} from '@ofServices/user.service';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {AppService} from '@ofServices/app.service';
import {State} from '@ofModel/processes.model';
import {NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {DisplayContext} from '@ofModel/templateGateway.model';

@Component({
    selector: 'of-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit, OnDestroy {

    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string = 'md';
    @Input() displayContext: any = DisplayContext.REALTIME;

    card: Card;
    childCards: Card[];
    cardState: State;
    unsubscribe$: Subject<void> = new Subject<void>();
    cardLoadingInProgress = false;
    currentSelectedCardId: string;
    protected _currentPath: string;

    constructor(protected store: Store<AppState>
        , protected businessconfigService: ProcessesService
        , protected userService: UserService
        , protected appService?: AppService
    ) {
    }

    ngOnInit() {
        this.store.select(cardSelectors.selectCardStateSelectedWithChildCards)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([card, childCards]: [Card, Card[]]) => {
                if (!!card) {
                    this.businessconfigService.queryProcess(card.process, card.processVersion)
                        .subscribe({
                            next: businessconfig => {
                                this.card = card;
                                this.childCards = childCards;
                                this.cardLoadingInProgress = false;
                                if (!!businessconfig) {
                                    this.cardState = businessconfig.extractState(card);
                                    if (!this.cardState) {
                                        console.log(new Date().toISOString(), `WARNING state ${card.state} does not exist for process ${card.process}`);
                                        this.cardState = new State();
                                    }
                                } else {
                                    console.log(new Date().toISOString(), `WARNING process `
                                        + ` ${card.process} with version ${card.processVersion} does not exist.`)
                                    this.cardState = new State();
                                }

                            },
                            error: () => {
                                console.log(new Date().toISOString(), `WARNING process `
                                    + ` ${card.process} with version ${card.processVersion} does not exist.`);
                                this.card = card;
                                this.childCards = childCards;
                                this.cardLoadingInProgress = false;
                                this.cardState = new State();
                            }
                        });
                }
            });

        this.store.select(selectCurrentUrl)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(url => {
                if (!!url) {
                    const urlParts = url.split('/');
                    const CURRENT_PAGE_INDEX = 1;
                    this._currentPath = urlParts[CURRENT_PAGE_INDEX];
                }
            });
        this.checkForCardLoadingInProgressForMoreThanOneSecond();

    }

    // we show a spinner on screen if card loading take more than 1 second
    checkForCardLoadingInProgressForMoreThanOneSecond() {
        this.store.select(feedSelectors.selectLightCardSelection) 
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((cardId) => {   // a new card has been selected and will be downloaded 
                this.currentSelectedCardId = cardId;
                setTimeout(() => {
                    if (this.currentSelectedCardId == cardId) // the selected card has not changed in between 
                    {
                        if (!this.card) this.cardLoadingInProgress = !!this.currentSelectedCardId;
                        else this.cardLoadingInProgress = (this.card.id != this.currentSelectedCardId);
                    }
                }, 1000);
            })

    }


    public isSmallscreen() {
        return (window.innerWidth < 1000);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
