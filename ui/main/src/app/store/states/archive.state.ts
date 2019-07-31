/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";

export interface ArchiveState extends EntityState<LightCard> {
    selectedCardId: string;
    lastCards: LightCard[];
    filters: Map<string,string[]>; //TODO Explain path/values or create data type
}

export function compareByPublishDate(card1: LightCard, card2: LightCard){
    return card1.publishDate - card2.publishDate;
}

export const LightCardAdapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>({
    sortComparer:compareByPublishDate
});

export const archiveInitialState: ArchiveState = LightCardAdapter.getInitialState(
    {
        selectedCardId: null,
        lastCards: [],
        filters: new Map()
    });
