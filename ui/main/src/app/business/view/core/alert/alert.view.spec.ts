/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {ConfigService} from 'app/business/services/config.service';
import {firstValueFrom} from 'rxjs';
import {AlertView} from './alert.view';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {Message, MessageLevel} from '@ofModel/message.model';
import {I18n} from '@ofModel/i18n.model';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';

describe('Alert view ', () => {
    let configService: ConfigService;
    let configServerMock: ConfigServerMock;
    let translationService: TranslationService;

    beforeEach(() => {
        jasmine.clock().uninstall();
        configServerMock = new ConfigServerMock();
        configService = new ConfigService(configServerMock);
        translationService = new TranslationServiceMock();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('GIVEN an alertView WHEN no message is sent THEN no message is display ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());
        const alertView = new AlertView(configService, translationService);
        await delay();
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message WHEN message is sent THEN message is displayed ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService,translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
    });

    it('GIVEN a message with a translation key WHEN message is sent THEN message is displayed translated ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(
            new Message('', MessageLevel.DEBUG, new I18n('messageKey', new Map().set('param', 'value')))
        );
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('{TranslationMock : key=messageKey;values=value}');
    });

    it('GIVEN a message WHEN message is DEBUG level THEN message background color is blue (#0070da) ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService,translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#0070da');
    });

    it('GIVEN a message WHEN message is INFO level THEN message background color is green (#67a854) ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.INFO));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#67a854');
    });

    it('GIVEN a message WHEN message is ERROR level THEN message background color is orange (#e87a08) ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.ERROR));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#e87a08');
    });

    it('GIVEN a message WHEN message is BUSINESS level THEN message background color is red (#a71a1a) ', async () => {
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService,  translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().backgroundColor).toEqual('#a71a1a');
    });

    it('GIVEN messageOnBottomOfTheScreen is true  WHEN message is display THEN message is on bottom of the screen ', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: true}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().style).toEqual('bottom: 0');
    });

    it('GIVEN messageOnBottomOfTheScreen is false  WHEN message is display THEN message is on top of the screen ', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        expect(alertView.getAlertPage().style).toEqual('top: 0');
    });

    it('GIVEN a message WHEN alert is closed THEN message disappear', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        alertView.closeAlert();
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message WHEN message is displayed THEN message disappears after 5 seconds', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        const alertView = new AlertView(configService,  translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        jasmine.clock().tick(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message is displayed WHEN a new message arrives THEN the new message disappears after 5 seconds', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.DEBUG));
        jasmine.clock().tick(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(4000);
        AlertMessageService.sendAlertMessage(new Message('message2', MessageLevel.DEBUG));
        jasmine.clock().tick(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message2');
        jasmine.clock().tick(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message2');
        jasmine.clock().tick(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('GIVEN a message of level BUSINESS WHEN messageBusinessAutoClose is false or not set THEN message never disappear automatically', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageOnBottomOfTheScreen: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        jasmine.clock().tick(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(10000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(100000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
    });

    it('GIVEN a message of level BUSINESS WHEN messageBusinessAutoClose is true THEN message disappear after 5 seconds', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {messageBusinessAutoClose: true}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        jasmine.clock().tick(1);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(4000);
        expect(alertView.getAlertPage().display).toBeTruthy();
        expect(alertView.getAlertPage().message).toEqual('message');
        jasmine.clock().tick(1100);
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    function delay() {
        return new Promise((resolve) => setTimeout(resolve, 1));
    }

    it('Given a message of level BUSINESS WHEN hideBusinessMessages is true THEN message should not appear', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {hideBusinessMessages: true}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService,translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        await delay();
        expect(alertView.getAlertPage().display).toBeFalsy();
    });

    it('Given a message of level BUSINESS WHEN hideBusinessMessages is false THEN message should appear', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({alerts: {hideBusinessMessages: false}}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
    });

    it('Given a message of level BUSINESS WHEN hideBusinessMessages is not set THEN message should appear', async () => {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({}, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(configService.loadWebUIConfiguration());

        const alertView = new AlertView(configService, translationService);
        AlertMessageService.sendAlertMessage(new Message('message', MessageLevel.BUSINESS));
        await delay();
        expect(alertView.getAlertPage().display).toBeTruthy();
    });
});
