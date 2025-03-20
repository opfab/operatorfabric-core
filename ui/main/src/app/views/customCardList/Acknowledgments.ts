/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgePermission} from '@ofServices/acknowlegment/AcknowledgePermission';
import {AcknowledgeService} from '@ofServices/acknowlegment/AcknowledgeService';
import {CustomScreenDefinition} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UsersService} from '@ofServices/users/UsersService';
import {OpfabStore} from '@ofStore/OpfabStore';

export class Acknowledgments {
    private readonly customScreenDefinition: CustomScreenDefinition;

    constructor(customScreenDefinition: CustomScreenDefinition) {
        this.customScreenDefinition = customScreenDefinition;
    }

    public isAcknowledgmentButtonVisible(): boolean {
        return this.customScreenDefinition.showAcknowledgmentButton;
    }

    public addAcknowledgmentPossibleForCardToResults(results: any[]): any[] {
        return results.map((result) => {
            const isAcknowledgmentPossible = this.isAcknowlegmentPossibleForCard(result.cardId);
            return {
                ...result,
                isAcknowledgmentPossible
            };
        });
    }

    private isAcknowlegmentPossibleForCard(cardId: string): boolean {
        const card = OpfabStore.getLightCardStore().getLightCard(cardId);
        return AcknowledgePermission.isAcknowledgmentAllowed(
            UsersService.getCurrentUserWithPerimeters(),
            card,
            ProcessesService.getProcess(card.process)
        );
    }

    public sendAcknowledgments(cardIds: string[]) {
        cardIds.forEach((cardId) => {
            const card = OpfabStore.getLightCardStore().getLightCard(cardId);
            AcknowledgeService.postAcknowledgement(card).subscribe();
        });
    }
}
