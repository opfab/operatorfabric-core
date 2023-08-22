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
    it('GIVEN a card WHEN filling content THEN text is correct', () => {
        opfab.currentCard.getCard = function () {
            return {
                data: {
                    freq: "MONTHLY",
                    bysetpos: ["1"],
                    byweekday: ["MO"],
                    bymonthday: ["1"],
                    bymonth: [1]
                }
            };
        };
        let text = view.fillTexts();
        expect(text.textForBysetpos).toEqual("Translation of buildInTemplate.taskCard.the Translation of buildInTemplate.taskCard.first, ");
        expect(text.textForByWeekday).toEqual(" Translation of shared.calendar.monday");
        expect(text.textForBymonthday).toEqual("Translation of buildInTemplate.taskCard.firstDayOfTheMonth<br/><br/>");
        expect(text.textForBymonth).toEqual("Translation of buildInTemplate.taskCard.in Translation of shared.calendar.january");
    });
});
