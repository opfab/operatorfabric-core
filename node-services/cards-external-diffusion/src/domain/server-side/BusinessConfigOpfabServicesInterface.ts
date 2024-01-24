/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import Handlebars from 'handlebars';
import GetResponse from '../../common/server-side/getResponse';
import EventBusListener from '../../common/server-side/eventBus';
import {EventListener} from '../../common/server-side/eventListener';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';

export default class BusinessConfigOpfabServicesInterface
    extends OpfabServicesInterface
    implements EventListener
{
    private static configCache: Map<string, any> = new Map();
    private static templateCompilerCache: Map<string, Map<string, Function> | undefined> = new Map();

    private listener: EventBusListener;

    constructor() {
        super();
        this.listener = new EventBusListener().addListener(this);
    }

    async onMessage(message: any) {
        const businessconfigMessage: string = message.content.toString();
        this.logger.info('EventBusListener received businessconfig update event: ' + businessconfigMessage);
        if (businessconfigMessage == 'BUSINESS_CONFIG_CHANGE') {
            this.clearBusinessConfigCache();
        }
    }

    public clearBusinessConfigCache() {
        BusinessConfigOpfabServicesInterface.templateCompilerCache = new Map();
        BusinessConfigOpfabServicesInterface.configCache = new Map();
    }

    public setEventBusConfiguration(eventBusConfig: any) {
        this.listener
            .setHost(eventBusConfig.host)
            .setPort(eventBusConfig.port)
            .setUsername(eventBusConfig.username)
            .setPassword(eventBusConfig.password)
            .setQueue('process', '', {exclusive: true, autoDelete: true});
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        this.listener.setLogger(logger);
        return this;
    }

    public startListener() {
        this.listener.start();
    }

    public stopListener() {
        this.listener.stop();
    }

    public async fetchProcessConfig(processId: string, version: string): Promise<any> {
        const key = processId + '.' + version;
        if (!BusinessConfigOpfabServicesInterface.configCache.has(key)) {
            const cardConfigResponse = await this.getProcessConfig(processId, version);
            if (cardConfigResponse.isValid()) {
                BusinessConfigOpfabServicesInterface.configCache.set(
                    key,
                    cardConfigResponse.getData()
                );
            }
        }
        return BusinessConfigOpfabServicesInterface.configCache.get(key);
    }

    public async fetchTemplate(processId: string, emailBodyTemplate: string, version: string): Promise<Function> {
        const key = processId + '.' + version;
        let cachedMap: Map<string, Function> | undefined = new Map();

        if (BusinessConfigOpfabServicesInterface.templateCompilerCache.has(key)) {
            cachedMap = BusinessConfigOpfabServicesInterface.templateCompilerCache.get(key);
            if (!cachedMap?.has(emailBodyTemplate)) {
                await this.addTemplateToCache(processId, emailBodyTemplate, version, key);
            }
        } else {
            await this.addTemplateToCache(processId, emailBodyTemplate, version, key);
        }

        const compiler = BusinessConfigOpfabServicesInterface.templateCompilerCache.get(key)?.get(emailBodyTemplate);
        if (compiler) {
            return compiler;
        } else {
            return (
                () => {return null;}
            );
        }
    }

    private async addTemplateToCache( processId: string, emailBodyTemplate: string, version: string, key: string): Promise<void> {
        let cachedMap: Map<string, Function> | undefined = new Map();
        const templateResponse = await this.getTemplate(processId, emailBodyTemplate, version);
        if (templateResponse.isValid()) {
            const cachedCompiler: Function = Handlebars.compile(templateResponse.getData());
            cachedMap.set(emailBodyTemplate, cachedCompiler);
            BusinessConfigOpfabServicesInterface.templateCompilerCache.set(key, cachedMap);
        }
    }

    public async getProcessConfig(id: string, version: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetProcessConfigRequest(id, version);
            if (response?.data) {
                return new GetResponse(response.data, true);
            } else {
                this.logger.warn('No process config defined in HTTP response');
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get process config ' + id, e);
            return new GetResponse([], false);
        }
    }

    public async getTemplate(processId: string, templateName: string, version: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetTemplateRequest(processId, templateName, version);
            if (response?.data) {
                return new GetResponse(response.data, true);
            } else {
                this.logger.warn('No template defined in HTTP response');
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get template ' + templateName, e);
            return new GetResponse([], false);
        }
    }

    sendGetProcessConfigRequest(processId: string, version: string): Promise<any> {
        let url = this.opfabBusinessconfigUrl + '/businessconfig/processes/' + processId;
        if (version) {
            url = url + '?version=' + version;
        }
        return this.sendRequest({
            method: 'get',
            url: url,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetTemplateRequest(processId: string, templateName: string, version: string): Promise<any> {
        let url = this.opfabBusinessconfigUrl + '/businessconfig/processes/' + processId + '/templates/' + templateName;
        if (version) {
            url = url + '?version=' + version;
        }
        return this.sendRequest({
            method: 'get',
            url: url,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }
}
