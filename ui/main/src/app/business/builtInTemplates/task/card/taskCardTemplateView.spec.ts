/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TaskCardTemplateView} from './taskCardTemplateView';
import {CurrentCardAPI} from 'app/api/currentcard.api';
import {initOpfabAPI} from '@tests/helpers';

describe('Task Card Template View', () => {
    let view: TaskCardTemplateView;
    beforeEach(() => {
        initOpfabAPI();
        view = new TaskCardTemplateView();
    });

    it('GIVEN a card WHEN get data THEN data is provided', () => {
        CurrentCardAPI.currentCard.card = {
            data: {
                taskTitle: 'My task Title',
                richTaskDescription: 'My task Description'
            },
            rRule: {
                byhour: [5],
                byminute: [15],
                durationInMinutes: 15
            }
        };
        expect(view.getTaskTitle()).toEqual('My task Title');
        expect(view.getTaskDescription()).toEqual('My task Description');
        expect(view.getHourAndMinutes()).toEqual('05:15');
        expect(view.getDurationInMinutes()).toEqual(15);
    });

    it('GIVEN a card taskDescription and not richTaskDescription WHEN get data THEN task description has rich text format', () => {
        CurrentCardAPI.currentCard.card = {
            data: {
                taskTitle: 'My task Title',
                taskDescription: 'My task Description'
            },
            rRule: {
                byhour: [5],
                byminute: [15],
                durationInMinutes: 15
            }
        };
        expect(view.getTaskDescription()).toEqual(
            '{&quot;ops&quot;:[{&quot;insert&quot;:&quot;My task Description&quot;}]}'
        );
    });

    it('GIVEN a card WHEN filling content THEN text is correct', () => {
        CurrentCardAPI.currentCard.card = {
            data: {},
            rRule: {
                freq: 'MONTHLY',
                bysetpos: [1],
                byweekday: ['MO'],
                bymonthday: [1],
                bymonth: [1]
            }
        };
        const text = view.getTexts();
        expect(text.textForBySetPos).toEqual(
            'Translation (en) of builtInTemplate.taskCard.the Translation (en) of builtInTemplate.taskCard.first '
        );
        expect(text.textForByWeekDay).toEqual(' Translation (en) of shared.calendar.monday');
        expect(text.textForByMonthDay).toEqual(
            'Translation (en) of builtInTemplate.taskCard.firstDayOfTheMonth<br/><br/>'
        );
        expect(text.textForByMonth).toEqual(
            'Translation (en) of builtInTemplate.taskCard.in Translation (en) of shared.calendar.january'
        );
    });

    it('GIVEN a card without recurrence WHEN get data THEN data is provided', () => {
        CurrentCardAPI.currentCard.card = {
            startDate: new Date('2025-02-28T09:15:00').getTime(),
            data: {
                taskTitle: 'My task Title for my non-recurrent card',
                richTaskDescription: 'My task Description for my non-recurrent card',
                durationInMinutes: 15
            }
        };
        expect(view.getTaskTitle()).toEqual('My task Title for my non-recurrent card');
        expect(view.getTaskDescription()).toEqual('My task Description for my non-recurrent card');
        expect(view.getDateForCardWithoutRecurrence()).toEqual(
            '<br/><br/>Translation (en) of builtInTemplate.taskUserCard.the 28/02/2025'
        );
        expect(view.getHourAndMinutes()).toEqual('09:15');
        expect(view.getDurationInMinutes()).toEqual(15);
    });
});
