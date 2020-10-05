/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Card, Detail } from '@ofModel/card.model';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import * as cardSelectors from '@ofStore/selectors/card.selectors';
import { ProcessesService } from '@ofServices/processes.service';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { selectIdentifier } from '@ofStore/selectors/authentication.selectors';
import { UserService } from '@ofServices/user.service';
import { User } from '@ofModel/user.model';
import { UserWithPerimeters } from '@ofModel/userWithPerimeters.model';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import { AppService, PageType } from '@ofServices/app.service';

@Component({
    selector: 'of-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit, OnDestroy {

    card: Card;
    childCards: Card[];
    user: User;
    details: Detail[];
    unsubscribe$: Subject<void> = new Subject<void>();
    private _currentPath: string;

    constructor(private store: Store<AppState>,
        private businessconfigService: ProcessesService, private userService: UserService,
        private appService: AppService) {
    }

    ngOnInit() {
        this.store.select(cardSelectors.selectCardStateSelectedWithChildCards)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([card, childCards]: [Card, Card[]]) => {
                this.card = card;
                this.childCards = childCards;
                if (card) {
                    if (card.details) {
                        this.details = [...card.details];
                    } else {
                        this.details = [];
                    }
                    this.businessconfigService.queryProcess(this.card.process, this.card.processVersion)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(businessconfig => {
                            if (businessconfig) {
                                const state = businessconfig.extractState(this.card);
                                if (state != null) {
                                    this.details.push(...state.details);
                                }
                            }
                        },
                            error => console.log(`something went wrong while trying to fetch process for ${this.card.process} with ${this.card.processVersion} version.`)
                        );
                }
            });

        this.store.select(selectCurrentUrl)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(url => {
                if (url) {
                    const urlParts = url.split('/');
                    this._currentPath = urlParts[1];
                }
            });

        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) {
            this.user = userWithPerimeters.userData;
        }

    }

    closeDetails() {
        this.appService.closeDetails(this._currentPath);
    }

    get isButtonCloseVisible() {
        return this.appService.pageType !== PageType.CALENDAR;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
