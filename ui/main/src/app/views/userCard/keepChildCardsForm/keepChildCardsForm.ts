/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {EditionMode, InputFieldName, UserCardUIControl} from '../userCard.model';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {CardAction} from 'app/model/CardAction';
import {UserCardTemplateGateway} from '@ofServices/templateGateway/UserCardTemplateGateway';

export class KeepChildCardsForm {
    private keepChildCards: boolean;
    private keepChildCardsVisible: boolean = false;

    constructor(private readonly userCardUIControl: UserCardUIControl) {}

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
            this.keepChildCards = cardKeepChildCards ?? UserCardTemplateGateway.getInitialKeepChildCards() ?? true;
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
