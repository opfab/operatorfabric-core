/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {TaskCardTemplateView} from './taskCardTemplateView';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';

describe('Question UserCard template', () => {
    let view: TaskCardTemplateView;
    beforeEach(() => {
        const translationService = new TranslationServiceMock();
        OpfabAPIService.setTranslationService(translationService);
        OpfabAPIService.init();
        OpfabAPIService.initAPI();
        view = new TaskCardTemplateView();
    });

    it('GIVEN a card WHEN get data THEN data is provided', () => {
        OpfabAPIService.currentCard.card = {
            data: {
                taskTitle: 'My task Title',
                taskDescription: 'My task Description',
                byhour: ['5'],
                byminute: ['15'],
                durationInMinutes: '15'
            }
        };
        expect(view.getTaskTitle()).toEqual('My task Title');
        expect(view.getTaskDescription()).toEqual('My task Description');
        expect(view.getByHour()).toEqual('05');
        expect(view.getByMinute()).toEqual('15');
        expect(view.getDurationInMinutes()).toEqual('15');
    });
    it('GIVEN a card WHEN filling content THEN text is correct', () => {
        OpfabAPIService.currentCard.card = {
            data: {
                freq: 'MONTHLY',
                bysetpos: ['1'],
                byweekday: ['MO'],
                bymonthday: ['1'],
                bymonth: [1]
            }
        };
        const text = view.fillTexts();
        expect(text.textForBysetpos).toEqual(
            'Translation (en) of builtInTemplate.taskCard.the Translation (en) of builtInTemplate.taskCard.first '
        );
        expect(text.textForByWeekday).toEqual(' Translation (en) of shared.calendar.monday');
        expect(text.textForBymonthday).toEqual(
            'Translation (en) of builtInTemplate.taskCard.firstDayOfTheMonth<br/><br/>'
        );
        expect(text.textForBymonth).toEqual(
            'Translation (en) of builtInTemplate.taskCard.in Translation (en) of shared.calendar.january'
        );
    });
});
