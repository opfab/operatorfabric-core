/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OnInit, Component, OnDestroy} from '@angular/core';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Subject, takeUntil, timer} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {Utilities} from 'app/business/common/utilities';
import {OpfabStore} from '../../../../store/opfabStore';
import {NgFor, NgIf, LowerCasePipe} from '@angular/common';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {NavigationService} from '@ofServices/navigation/NavigationService';

@Component({
    selector: 'of-pinned-cards',
    templateUrl: './pinned-cards.component.html',
    styleUrls: ['./pinned-cards.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, NgbPopover, TranslateModule, LowerCasePipe]
})
export class PinnedCardsComponent implements OnInit, OnDestroy {
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();
    pinnedCards: LightCard[];
    visiblePinnedCards: LightCard[];
    hiddenPinnedCards: LightCard[];

    maxVisiblePinnedCards = 6;

    maxHiddenPinnedCards = 20;

    ngOnInit(): void {
        this.pinnedCards = [];

        OpfabStore.getLightCardStore()
            .getLightCards()
            .subscribe((cards) => this.setPinnedCards(cards));

        timer(10000, 10000)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((t) => this.checkPinnedCardsEndDate());
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
                const processDefinition = ProcessesService.getProcess(card.process);
                return (
                    processDefinition.states.get(card.state)?.automaticPinWhenAcknowledged &&
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

    public areThereTooManyCardsForWindow(): boolean {
        const maxPinnedCardsForWindow = Math.floor(window.innerWidth / 290);

        if (this.maxVisiblePinnedCards !== maxPinnedCardsForWindow) {
            this.maxVisiblePinnedCards = maxPinnedCardsForWindow;
            this.setVisiblePinnedCards();
        }

        return this.pinnedCards.length > this.maxVisiblePinnedCards;
    }

    public areThereTooManyHiddenCards(): boolean {
        return this.pinnedCards.length > this.maxVisiblePinnedCards + this.maxHiddenPinnedCards;
    }

    public select(id) {
        NavigationService.navigateToCard(id);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
