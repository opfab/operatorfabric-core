/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {TaskCardTemplateView} from './taskCardTemplateView';

declare const opfab;

describe('Question UserCard template', () => {
    let view: TaskCardTemplateView;
    beforeEach(() => {
        initOpfabApiMock();
        view = new TaskCardTemplateView();
    });

    it('GIVEN a card WHEN get data THEN data is provided', () => {
        opfab.currentCard.getCard = function () {
            return {
                data: {
                    taskDescription: 'My task Description',
                    byhour: ["5"],
                    byminute: ["15"],
                    durationInMinutes: '15'
                }
            };
        };
        expect(view.getTaskDescription()).toEqual('My task Description');
        expect(view.getByHour()).toEqual('05');
        expect(view.getByMinute()).toEqual('15');
        expect(view.getDurationInMinutes()).toEqual('15');
    });
});
