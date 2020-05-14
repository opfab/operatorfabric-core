/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
// import { IArchiveFilter } from '@ofModel/archive-filter.model';

export interface ArchiveState {
    selectedCardId: string;
    resultPage: Page<LightCard>;
    filters: Map<string, string[]>;
    loading: boolean;
    firstLoading : boolean;
}

export const archiveInitialState: ArchiveState = {
        selectedCardId: null,
        resultPage: new Page<LightCard>(1, 0 , []),
        filters: new Map(),
        loading: false,
        firstLoading : false
};
