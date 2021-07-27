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
import {ProcessesService} from '@ofServices/processes.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserService} from '@ofServices/user.service';
import {User} from '@ofModel/user.model';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {AppService} from '@ofServices/app.service';
import {State as CardState, State} from '@ofModel/processes.model';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-card-details',
    template: `

            <div *ngIf="card && cardState" style="font-size:13px;">
                <of-detail   [cardState]="cardState" [card]="card" [childCards]="childCards"
                           [user]="user" [currentPath]="_currentPath" [parentModalRef]="parentModalRef" [screenSize]="screenSize">
                </of-detail>
            </div>
        `
})
export class CardDetailsComponent implements OnInit, OnDestroy {


    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string = 'md';

    card: Card;
    childCards: Card[];
    user: User;
    cardState: CardState;
    unsubscribe$: Subject<void> = new Subject<void>();
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
                            error: error => {
                                console.log(new Date().toISOString(), `WARNING process `
                                    + ` ${card.process} with version ${card.processVersion} does not exist.`);
                                this.card = card;
                                this.childCards = childCards;
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

        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
