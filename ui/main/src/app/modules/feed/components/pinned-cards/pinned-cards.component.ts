/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OnInit, Component, OnDestroy} from "@angular/core";
import {ProcessesService} from "@ofServices/processes.service";
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {LightCardsStoreService} from "@ofServices/lightcards/lightcards-store.service";
import {Subject, takeUntil, timer} from "rxjs";
import {LightCard} from "@ofModel/light-card.model";
import {Router} from "@angular/router";
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';


@Component({
    selector: 'of-pinned-cards',
    templateUrl: './pinned-cards.component.html',
    styleUrls: ['./pinned-cards.component.scss']
})
export class PinnedCardsComponent implements OnInit, OnDestroy {
    pinnedCards: LightCard[];
    currentPath: string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private lightCardsStoreService: LightCardsStoreService,
                private router: Router,
                private store: Store<AppState>,
                private processesService: ProcessesService) {
    }

    ngOnInit(): void {
        this.store
        .select(selectCurrentUrl)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((url) => {
            if (url) {
                const urlParts = url.split('/');
                this.currentPath = urlParts[1];
            }
        });

        this.pinnedCards = [];
        
        this.lightCardsStoreService.getLightCards()
            .subscribe( cards => this.pinnedCards = (!!cards && cards.length) > 0 ? this.getPinnedCards(cards) : []);

        timer(10000, 10000)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(t =>
                this.checkPinnedCardsEndDate()
            );
    }

    private getPinnedCards(cards: LightCard[]) {
        return cards.filter(card => {
            const processDefinition = this.processesService.getProcess(card.process);
            return processDefinition.extractState(card).automaticPinWhenAcknowledged && card.hasBeenAcknowledged && (!card.endDate || card.endDate > Date.now());
        });
    }

    private checkPinnedCardsEndDate(): void {
        this.pinnedCards = this.pinnedCards.filter(card => !card.endDate || card.endDate > Date.now());
    }

    public select(id) {
        this.router.navigate(['/' + this.currentPath, 'cards', id]);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}

