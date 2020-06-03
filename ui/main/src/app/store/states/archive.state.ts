

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
