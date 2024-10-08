/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofModel/card.model';
import {EditionMode, InputFieldName, UserCardUIControl} from '../userCard.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {CardAction} from '@ofModel/light-card.model';

export class KeepChildCardsForm {
    private keepChildCards: boolean;
    private keepChildCardsVisible: boolean = false;

    constructor(private userCardUIControl: UserCardUIControl) {}

    public setValueAndVisibility(
        processId: string,
        stateId: string,
        card: Card = undefined,
        editionMode?: EditionMode
    ) {
        const state = ProcessesService.getProcess(processId).states.get(stateId);

        if (state?.response) {
            this.keepChildCardsVisible = state.userCard?.keepChildCardsVisible ?? false;
            this.userCardUIControl.setInputVisibility(
                InputFieldName.KeepChildCards,
                this.keepChildCardsVisible && editionMode === EditionMode.EDITION
            );
            const cardKeepChildCards = card?.actions?.includes(CardAction.KEEP_CHILD_CARDS);
            this.keepChildCards = cardKeepChildCards ?? OpfabAPIService.currentUserCard.initialKeepChildCards ?? true;
            this.userCardUIControl.setKeepChildCards(this.keepChildCards);
        } else {
            this.userCardUIControl.setInputVisibility(InputFieldName.KeepChildCards, false);
        }
    }

    public getSelectedKeepChildCards(): boolean {
        return this.keepChildCards;
    }

    public isKeepChildCardsVisible(): boolean {
        return this.keepChildCardsVisible;
    }

    public userSelectsKeepChildCards(keepChildCards: boolean) {
        this.keepChildCards = keepChildCards;
    }
}
