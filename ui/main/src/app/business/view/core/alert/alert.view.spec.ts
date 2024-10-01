/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertView} from './alert.view';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {Message, MessageLevel} from '@ofModel/message.model';
import {I18n} from '@ofModel/i18n.model';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {loadWebUIConf, waitForAllPromises} from '@tests/helpers';

describe('Alert view ', () => {
    let translationService: TranslationService;

    beforeEach(() => {
        jest.useRealTimers();
        translationService = new TranslationServiceMock();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('GIVEN an alertView WHEN no message is sent THEN no message is display ', async () => {
        await loadWebUIConf({});
        const alertView = new AlertView(translationService);
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message WHEN message is sent THEN message is displayed ', async () => {
        await loadWebUIConf({});
        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
    });

    it('GIVEN a message with a translation key WHEN message is sent THEN message is displayed translated ', async () => {
        await loadWebUIConf({});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(
            new Message('', MessageLevel.DEBUG, new I18n('messageKey', {param: 'value'}))
        );
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('Translation (en) of messageKey with values=value');
    });

    it('GIVEN a message WHEN message is DEBUG level THEN message background color is blue (#0070da) ', async () => {
        await loadWebUIConf({});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#0070da');
    });

    it('GIVEN a message WHEN message is INFO level THEN message background color is green (#67a854) ', async () => {
        await loadWebUIConf({});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.INFO));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#67a854');
    });

    it('GIVEN a message WHEN message is ERROR level THEN message background color is orange (#e87a08) ', async () => {
        await loadWebUIConf({});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.ERROR));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#e87a08');
    });

    it('GIVEN a message WHEN message is ALARM level THEN message background color is red (#a71a1a) ', async () => {
        await loadWebUIConf({});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.ALARM));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#a71a1a');
    });

    it('GIVEN messageOnBottomOfTheScreen is true  WHEN message is display THEN message is on bottom of the screen ', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: true}});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().style).toEqual('bottom: 0');
    });

    it('GIVEN messageOnBottomOfTheScreen is false  WHEN message is display THEN message is on top of the screen ', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: false}});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().style).toEqual('top: 0');
    });

    it('GIVEN a message WHEN alert is closed THEN message disappear', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: false}});

        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await waitForAllPromises();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        alertView.closeAlert();
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message WHEN message is displayed THEN message disappears after 5 seconds', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: false}});

        jest.useFakeTimers();
        jest.setSystemTime(new Date(0));
        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        jest.advanceTimersByTime(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message is displayed WHEN a new message arrives THEN the new message disappears after 5 seconds', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: false}});

        jest.useFakeTimers();
        jest.setSystemTime(new Date(0));
        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        jest.advanceTimersByTime(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(4000);
        AlertMessageService.sendAlertMessage(new Message('message2', MessageLevel.DEBUG));
        jest.advanceTimersByTime(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message2');
        jest.advanceTimersByTime(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message2');
        jest.advanceTimersByTime(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message of level ALARM WHEN alarmLevelAutoClose is false or not set THEN message never disappear automatically', async () => {
        await loadWebUIConf({alerts: {messageOnBottomOfTheScreen: false}});

        jest.useFakeTimers();
        jest.setSystemTime(new Date(0));
        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.ALARM));
        jest.advanceTimersByTime(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(10000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(100000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
    });

    it('GIVEN a message of level ALARM WHEN alarmLevelAutoClose is true THEN message disappear after 5 seconds', async () => {
        await loadWebUIConf({alerts: {alarmLevelAutoClose: true}});

        jest.useFakeTimers();
        jest.setSystemTime(new Date(0));
        const alertView = new AlertView(translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.ALARM));
        jest.advanceTimersByTime(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jest.advanceTimersByTime(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });
});
