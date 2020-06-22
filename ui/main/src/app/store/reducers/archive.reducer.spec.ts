/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { reducer} from './archive.reducer';
import { UpdateArchiveFilter } from '@ofStore/actions/archive.actions';
import { archiveInitialState } from '@ofStore/states/archive.state';
import { LightCard } from '@ofModel/light-card.model';
import { Page } from '@ofModel/page.model';



describe('Archive Reducer', () => {

    it('should test the initial state', () => {
        const filters = new Map();
        const updateFilterAction = new UpdateArchiveFilter({filters});
        const result = reducer(archiveInitialState, updateFilterAction);
        expect(result.selectedCardId).toBeNull();
        expect(result.resultPage).toEqual(new Page<LightCard>(1, 0 , []));
        expect(result.filters.size).toEqual(0);
        expect(result.loading).toBeTruthy();
    });

    it('should test if the filters are updated successfully', () => {
        const filters = new Map();
        filters.set('publisher', ['test1', 'test2']);
        filters.set('publishDateFrom', ['1565770998']);
        const updateFilterAction = new UpdateArchiveFilter({filters});
        const result = reducer(archiveInitialState, updateFilterAction);
        expect(result.selectedCardId).toBeNull();
        expect(result.resultPage).toEqual(new Page<LightCard>(1, 0 , []));
        expect(result.filters.size).toEqual(2);
        expect(result.loading).toBeTruthy();
    });
});
