/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {DatesForm} from './datesForm';
import {EditionMode, InputFieldName} from '../userCard.model';
import {getOneCard, initOpfabAPI, setProcessConfiguration} from '@tests/helpers';
import {State} from '@ofServices/processes/model/Processes';
import {UserCardTemplateGateway} from 'app/business/templateGateway/userCardTemplateGateway';

declare const opfab: any;

async function setProcessConfigWithUserCardConfig(userCardConfig) {
    await setProcessConfiguration([
        {
            id: 'process1',
            version: 'v1',
            name: 'process name 1',
            states: new Map<string, State>([['state1_1', {name: 'State 1_1', userCard: userCardConfig}]])
        }
    ]);
}

describe('UserCard DatesForm', () => {
    let userCardUIControlMock: UserCardUIControlMock;
    let datesForm: DatesForm;
    beforeEach(async () => {
        userCardUIControlMock = new UserCardUIControlMock();
        datesForm = new DatesForm(userCardUIControlMock);
        initOpfabAPI();
    });
    describe('Visibility should be set', () => {
        // Dates visible by default
        [InputFieldName.StartDate, InputFieldName.EndDate].forEach((field) => {
            describe(`for ${field}`, () => {
                it(` to true if ${field} set visible in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig({[field + 'Visible']: true});
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toEqual(true);
                });
                it(`to false if ${field} set invisible in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig({[field + 'Visible']: false});
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toBe(false);
                });
                it(`to true if ${field} field is not configured in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig(undefined);
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toBe(true);
                });
            });
        });
        // Dates invisible by default
        [InputFieldName.Lttd, InputFieldName.ExpirationDate].forEach((field) => {
            describe(`for ${field}`, () => {
                it(`to true if ${field}  set visible in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig({[field + 'Visible']: true});
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toEqual(true);
                });
                it(`to false if ${field} set invisible in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig({[field + 'Visible']: false});
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toBe(false);
                });
                it(`to true if ${field} field is not configured in state configuration`, async () => {
                    await setProcessConfigWithUserCardConfig(undefined);
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    expect(userCardUIControlMock.inputVisibility_FctCalls[field]).toBe(false);
                });
            });
        });
    });
    describe('Dates initialization before template script execution', () => {
        beforeEach(() => {
            jasmine.clock().install();
            jasmine.clock().mockDate();
        });
        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('startDate = current date + one minute if startDate visible', async () => {
            await setProcessConfigWithUserCardConfig({startDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.StartDate)).toEqual(new Date().valueOf() + 60000);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toEqual(
                new Date().valueOf() + 60000
            );
        });
        it('startDate = undefined if startDate not visible', async () => {
            await setProcessConfigWithUserCardConfig({startDateVisible: false});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.StartDate)).toEqual(undefined);
        });
        it('endDate = current date + 24 hours if endDate Visible ', async () => {
            await setProcessConfigWithUserCardConfig({endDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.EndDate)).toEqual(new Date().valueOf() + 60000 * 60 * 24);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toEqual(
                new Date().valueOf() + 60000 * 60 * 24
            );
        });
        it('endDate = undefined if endDate not visible ', async () => {
            await setProcessConfigWithUserCardConfig({endDateVisible: false});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.EndDate)).toEqual(undefined);
        });
        it('lttd =  current date + 24 hours - 60 seconds if lttd visible (end date - 60s)', async () => {
            await setProcessConfigWithUserCardConfig({lttdVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');

            expect(datesForm.getDateValue(InputFieldName.Lttd)).toEqual(new Date().valueOf() + 60000 * 60 * 24);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.Lttd]).toEqual(
                new Date().valueOf() + 60000 * 60 * 24
            );
        });
        it('lttd date = undefined if lttd not visible', async () => {
            await setProcessConfigWithUserCardConfig({lttdVisible: false});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.Lttd)).toEqual(undefined);
        });
        it('expirationDate = current date + 24 hours if expirationDate  visible ', async () => {
            await setProcessConfigWithUserCardConfig({expirationDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');

            expect(datesForm.getDateValue(InputFieldName.ExpirationDate)).toEqual(
                new Date().valueOf() + 60000 * 60 * 24
            );
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.ExpirationDate]).toEqual(
                new Date().valueOf() + 60000 * 60 * 24
            );
        });
        it('expirationDate = undefined if expirationDate not visible ', async () => {
            await setProcessConfigWithUserCardConfig({expirationDateVisible: false});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            expect(datesForm.getDateValue(InputFieldName.ExpirationDate)).toEqual(undefined);
        });
    });
    describe('Dates initialization before template script execution with card for edition', () => {
        it('Should set startDate to the values of the card startDate', async () => {
            await setProcessConfigWithUserCardConfig({startDateVisible: true});
            const card = getOneCard({startDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
            expect(datesForm.getDateValue(InputFieldName.StartDate)).toEqual(1000);
        });
        it('Should set endDate to the values of the card endDate', async () => {
            await setProcessConfigWithUserCardConfig({endDateVisible: true});
            const card = getOneCard({endDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
            expect(datesForm.getDateValue(InputFieldName.EndDate)).toEqual(1000);
        });
        it('Should set lttd to the values of the card lttd', async () => {
            await setProcessConfigWithUserCardConfig({lttdVisible: true});
            const card = getOneCard({lttd: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
            expect(datesForm.getDateValue(InputFieldName.Lttd)).toEqual(1000);
        });
        it('Should set expirationDate to the values of the card expirationDate', async () => {
            await setProcessConfigWithUserCardConfig({expirationDateVisible: true});
            const card = getOneCard({expirationDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
            expect(datesForm.getDateValue(InputFieldName.ExpirationDate)).toEqual(1000);
        });
    });
    describe('Dates initialization before template script execution with card for copy', () => {
        it('Should NOT set startDate to the values of the card startDate', async () => {
            await setProcessConfigWithUserCardConfig({startDateVisible: true});
            const card = getOneCard({startDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.COPY);
            expect(datesForm.getDateValue(InputFieldName.StartDate)).not.toEqual(1000);
        });
        it('Should NOT set endDate to the values of the card endDate', async () => {
            await setProcessConfigWithUserCardConfig({endDateVisible: true});
            const card = getOneCard({endDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.COPY);
            expect(datesForm.getDateValue(InputFieldName.EndDate)).not.toEqual(1000);
        });
        it('Should NOT set lttd to the values of the card lttd', async () => {
            await setProcessConfigWithUserCardConfig({lttdVisible: true});
            const card = getOneCard({lttd: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.COPY);
            expect(datesForm.getDateValue(InputFieldName.Lttd)).not.toEqual(1000);
        });
        it('Should NOT set expirationDate to the values of the card expirationDate', async () => {
            await setProcessConfigWithUserCardConfig({expirationDateVisible: true});
            const card = getOneCard({expirationDate: 1000});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.COPY);
            expect(datesForm.getDateValue(InputFieldName.ExpirationDate)).not.toEqual(1000);
        });
    });
    describe('Dates initialization after template script execution', () => {
        beforeEach(() => {
            UserCardTemplateGateway.setEditionMode('CREATE');
        });
        it('Should set start date from template via method opfab.currentUserCard.setInitialStartDate ', async () => {
            await setProcessConfigWithUserCardConfig({startDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            opfab.currentUserCard.setInitialStartDate(2000);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.StartDate]).toEqual(2000);
            expect(datesForm.getDateValue(InputFieldName.StartDate)).toEqual(2000);
        });
        it('Should set end date from template via method opfab.currentUserCard.setInitialEndDate ', async () => {
            await setProcessConfigWithUserCardConfig({endDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            opfab.currentUserCard.setInitialEndDate(2000);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.EndDate]).toEqual(2000);
            expect(datesForm.getDateValue(InputFieldName.EndDate)).toEqual(2000);
        });
        it('Should set lttd from template via method opfab.currentUserCard.setInitialLttd ', async () => {
            await setProcessConfigWithUserCardConfig({lttdVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            opfab.currentUserCard.setInitialLttd(2000);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.Lttd]).toEqual(2000);
            expect(datesForm.getDateValue(InputFieldName.Lttd)).toEqual(2000);
        });
        it('Should set expiration date from template via method opfab.currentUserCard.setInitialExpirationDate', async () => {
            await setProcessConfigWithUserCardConfig({expirationDateVisible: true});
            datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            opfab.currentUserCard.setInitialExpirationDate(2000);
            datesForm.initDatesAfterTemplateScriptsExecution();
            expect(userCardUIControlMock.setDate_FctCalls[InputFieldName.ExpirationDate]).toEqual(2000);
            expect(datesForm.getDateValue(InputFieldName.ExpirationDate)).toEqual(2000);
        });
    });
    describe('User sets date', () => {
        [InputFieldName.StartDate, InputFieldName.EndDate, InputFieldName.Lttd, InputFieldName.ExpirationDate].forEach(
            (field) => {
                it(`Should get ${field} after setting ${field}`, async () => {
                    await setProcessConfigWithUserCardConfig({});
                    datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
                    datesForm.userSetsDate(field, 1000);
                    expect(datesForm.getDateValue(field)).toEqual(1000);
                });
            }
        );
    });
    describe('Get date in template', () => {
        describe('After date set by user on UI ', () => {
            beforeEach(async () => {
                await setProcessConfigWithUserCardConfig({});
                datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1');
            });
            it('Should return the startDate via method opfab.currentUserCard.getStartDate when start date set', () => {
                datesForm.userSetsDate(InputFieldName.StartDate, 1000);
                expect(opfab.currentUserCard.getStartDate()).toEqual(1000);
            });
            it('Should return the endDate via method opfab.currentUserCard.getEndDate when end date set', () => {
                datesForm.userSetsDate(InputFieldName.EndDate, 1000);
                expect(opfab.currentUserCard.getEndDate()).toEqual(1000);
            });
            it('Should return the lttd via method opfab.currentUserCard.getLttd when lttd set', () => {
                datesForm.userSetsDate(InputFieldName.Lttd, 1000);
                expect(opfab.currentUserCard.getLttd()).toEqual(1000);
            });
            it('Should return the expirationDate via method opfab.currentUserCard.getExpirationDate when expiration date set', () => {
                datesForm.userSetsDate(InputFieldName.ExpirationDate, 1000);
                expect(opfab.currentUserCard.getExpirationDate()).toEqual(1000);
            });
        });
        describe('After date is initialized ', () => {
            it('Should return startDate via method opfab.currentUserCard.getStartDate', async () => {
                await setProcessConfigWithUserCardConfig({startDateVisible: true});
                const card = getOneCard({startDate: 200});
                datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
                expect(opfab.currentUserCard.getStartDate()).toEqual(200);
            });
            it('Should return endDate via method opfab.currentUserCard.getEndDate', async () => {
                await setProcessConfigWithUserCardConfig({endDateVisible: true});
                const card = getOneCard({endDate: 200});
                datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
                expect(opfab.currentUserCard.getEndDate()).toEqual(200);
            });
            it('Should return lttd via method opfab.currentUserCard.getStartDate', async () => {
                await setProcessConfigWithUserCardConfig({lttdVisible: true});
                const card = getOneCard({lttd: 200});
                datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
                expect(opfab.currentUserCard.getLttd()).toEqual(200);
            });
            it('Should return expirationDate via method opfab.currentUserCard.getExpirationDate', async () => {
                await setProcessConfigWithUserCardConfig({expirationDateVisible: true});
                const card = getOneCard({expirationDate: 200});
                datesForm.initDatesBeforeTemplateScriptsExecution('process1', 'state1_1', card, EditionMode.EDITION);
                expect(opfab.currentUserCard.getExpirationDate()).toEqual(200);
            });
        });
    });
});
