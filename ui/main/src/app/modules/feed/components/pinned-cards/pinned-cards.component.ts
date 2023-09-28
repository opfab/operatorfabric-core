/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OnInit, Component, OnDestroy, Input, OnChanges} from '@angular/core';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {Subject, takeUntil, timer} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from '@angular/router';
import {Utilities} from 'app/business/common/utilities';

@Component({
    selector: 'of-pinned-cards',
    templateUrl: './pinned-cards.component.html',
    styleUrls: ['./pinned-cards.component.scss']
})
export class PinnedCardsComponent implements OnInit, OnDestroy, OnChanges {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    pinnedCards: LightCard[];
    visiblePinnedCards: LightCard[];
    hiddenPinnedCards: LightCard[];

    @Input() maxVisiblePinnedCards = 6;

    maxHiddenPinnedCards = 20;

    constructor(
        private lightCardsStoreService: LightCardsStoreService,
        private router: Router,
        private processesService: ProcessesService
    ) {}

    ngOnInit(): void {

        this.pinnedCards = [];

        this.lightCardsStoreService.getLightCards().subscribe((cards) => this.setPinnedCards(cards));

        timer(10000, 10000)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((t) => this.checkPinnedCardsEndDate());
    }

    ngOnChanges(): void {
        this.setVisiblePinnedCards();
    }

    private setPinnedCards(cards: LightCard[]) {
        this.pinnedCards = [];

        if (cards?.length > 0) {
            this.pinnedCards = this.getPinnedCards(cards);
        }
        this.setVisiblePinnedCards();
    }

    private setVisiblePinnedCards() {
        if (this.pinnedCards) {
            this.visiblePinnedCards = [];
            this.hiddenPinnedCards = [];
            if (this.pinnedCards.length > this.maxVisiblePinnedCards) {
                this.visiblePinnedCards = this.pinnedCards.slice(0, this.maxVisiblePinnedCards);
                this.hiddenPinnedCards = this.pinnedCards.slice(this.maxVisiblePinnedCards);
                if (this.hiddenPinnedCards.length > this.maxHiddenPinnedCards) {
                    this.hiddenPinnedCards = this.hiddenPinnedCards.slice(0, this.maxHiddenPinnedCards);
                }
            } else this.visiblePinnedCards = this.pinnedCards;
        }
    }

    private getPinnedCards(cards: LightCard[]) {
        return cards
            .filter((card) => {
                const processDefinition = this.processesService.getProcess(card.process);
                return (
                    processDefinition.states.get((card.state))?.automaticPinWhenAcknowledged &&
                    card.hasBeenAcknowledged &&
                    (!card.endDate || card.endDate > Date.now())
                );
            })
            .sort((a, b) => Utilities.compareObj(a.publishDate, b.publishDate));
    }

    private checkPinnedCardsEndDate(): void {
        this.pinnedCards = this.pinnedCards.filter((card) => !card.endDate || card.endDate > Date.now());
        this.setVisiblePinnedCards();
    }

    public select(id) {
        this.router.navigate(['/feed', 'cards', id]);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
