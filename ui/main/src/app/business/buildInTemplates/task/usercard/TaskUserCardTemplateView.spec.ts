// /* Copyright (c) 2023, RTE (http://www.rte-france.com)
//  * See AUTHORS.txt
//  * This Source Code Form is subject to the terms of the Mozilla Public
//  * License, v. 2.0. If a copy of the MPL was not distributed with this
//  * file, You can obtain one at http://mozilla.org/MPL/2.0/.
//  * SPDX-License-Identifier: MPL-2.0
//  * This file is part of the OperatorFabric project.
//  */

import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {TaskCardTemplateView} from './taskUserCardTemplateView';

declare const opfab;

describe('Question UserCard template', () => {
    beforeEach(() => {
        initOpfabApiMock();
    });

    it('GIVEN a user WHEN create card THEN task description is empty', () => {
        const view = new TaskCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'CREATE';
        };
        opfab.currentCard.getCard = function () {
            return {data: {taskDescription: 'My task Description'}};
        };
        expect(view.getTaskDescription()).toEqual('');
    });

    it('GIVEN a user WHEN create card with data THEN card is provided with data', () => {
        const view = new TaskCardTemplateView();
        let taskDescription = "My task Description"; 
        let freq = 'DAILY';
        let durationInMinutes = "15";
        let minutesForReminder = "5";
        let byweekday = [ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ];
        let bymonth = [ 1, 2, 3];
        let bysetpos =[];
        let bymonthday =[];
        let time = "15:15";
        const specficCardInformation = view.getSpecificCardInformation(taskDescription, freq, durationInMinutes, minutesForReminder, byweekday, bymonth, bysetpos, bymonthday, time)
        expect(specficCardInformation.valid).toEqual(true);
        expect(specficCardInformation.card.data.taskDescription).toEqual("My task Description");
        expect(specficCardInformation.card.data.freq).toEqual('DAILY');
        expect(specficCardInformation.card.data.durationInMinutes).toEqual("15");
        expect(specficCardInformation.card.data.minutesForReminder).toEqual("5");
        expect(specficCardInformation.card.data.byweekday).toEqual([ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ]);
        expect(specficCardInformation.card.data.bymonth).toEqual([ 1, 2, 3]);
        expect(specficCardInformation.card.data.bysetpos).toEqual([]);
        expect(specficCardInformation.card.data.bymonthday).toEqual([]);
        expect(specficCardInformation.card.data.byhour).toEqual(['15']);
        expect(specficCardInformation.card.data.byminute).toEqual(['15']);
    });

    it('GIVEN an existing card WHEN user edit card THEN card data is current card data', () => {
        const view = new TaskCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {
                taskDescription: "My task Description",
                freq: 'DAILY',
                byhour: ["15"],
                byminute: ["15"],
                durationInMinutes: "15",
                minutesForReminder: "5",
                byweekday: [ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ],
                bymonth: [ 1, 2, 3],
                bysetpos: [],
                bymonthday: []
                }
            }
        }
        expect(view.getTaskDescription()).toEqual("My task Description");
        expect(view.getFrequency()).toEqual('DAILY');
        expect(view.getByHourAndMinutes()).toEqual('15:15');
        expect(view.getDurationInMinutes(null)).toEqual('15');
        expect(view.getMinutesForReminder(null)).toEqual('5');
        expect(view.getWeekDay()).toEqual([ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ]);
        expect(view.getSetPos()).toEqual([]);
        expect(view.getMonth()).toEqual([1,2,3]);
        expect(view.getMonthDay()).toEqual([]);
    });

    it('GIVEN an existing card WHEN user copy card THEN data is current card data', () => {
        const view = new TaskCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'COPY';
        };
        opfab.currentCard.getCard = function () {
            return {data: {
                taskDescription: "My task Description",
                freq: 'DAILY',
                byhour: ["15"],
                byminute: ["15"],
                durationInMinutes: "15",
                minutesForReminder: "5",
                byweekday: [ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ],
                bymonth: [ 1, 2, 3],
                bysetpos: [],
                bymonthday: []
                }
            }
        }
        expect(view.getTaskDescription()).toEqual("My task Description");
        expect(view.getFrequency()).toEqual('DAILY');
        expect(view.getByHourAndMinutes()).toEqual('15:15');
        expect(view.getDurationInMinutes(null)).toEqual('15');
        expect(view.getMinutesForReminder(null)).toEqual('5');
        expect(view.getWeekDay()).toEqual([ "MO", "TU", "WE", "TH", "FR", "SA", "SU" ]);
        expect(view.getSetPos()).toEqual([]);
        expect(view.getMonth()).toEqual([1,2,3]);
        expect(view.getMonthDay()).toEqual([]);
    });
});
