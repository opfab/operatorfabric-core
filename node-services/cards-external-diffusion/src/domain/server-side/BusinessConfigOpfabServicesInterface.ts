/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import Handlebars from 'handlebars';
import {HandlebarsHelper} from './handlebarsHelpers';
import GetResponse from '../../common/server-side/getResponse';
import EventBusListener from '../../common/server-side/eventBus';
import {EventListener} from '../../common/server-side/eventListener';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import {MailHandlebarsHelper} from './mailHandlebarsHelpers';

export default class BusinessConfigOpfabServicesInterface extends OpfabServicesInterface implements EventListener {
    private static configCache = new Map<string, any>();
    private static templateCompilerCache = new Map<string, Map<string, Function> | undefined>();

    private readonly listener: EventBusListener;

    constructor() {
        super();
        this.listener = new EventBusListener().addListener(this);
        HandlebarsHelper.init();
        MailHandlebarsHelper.init();
    }

    async onMessage(message: any): Promise<void> {
        const businessconfigMessage: string = message.content.toString();
        this.logger.info('EventBusListener received businessconfig update event: ' + businessconfigMessage);
        if (businessconfigMessage === 'BUSINESS_CONFIG_CHANGE') {
            this.clearBusinessConfigCache();
        }
    }

    public clearBusinessConfigCache(): void {
        BusinessConfigOpfabServicesInterface.templateCompilerCache = new Map();
        BusinessConfigOpfabServicesInterface.configCache = new Map();
    }

    public setEventBusConfiguration(eventBusConfig: any): this {
        this.listener
            .setHost(eventBusConfig.host as string)
            .setPort(eventBusConfig.port as number)
            .setUsername(eventBusConfig.username as string)
            .setPassword(eventBusConfig.password as string)
            .setQueue('process', '', {exclusive: true, autoDelete: true});
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        this.listener.setLogger(logger);
        return this;
    }

    public startListener(): void {
        this.listener.start();
    }

    public stopListener(): void {
        this.listener.stop();
    }

    public async fetchProcessConfig(processId: string, version: string): Promise<any> {
        const key = processId + '.' + version;
        if (!BusinessConfigOpfabServicesInterface.configCache.has(key)) {
            const cardConfigResponse = await this.getProcessConfig(processId, version);
            if (cardConfigResponse.isValid()) {
                BusinessConfigOpfabServicesInterface.configCache.set(key, cardConfigResponse.getData());
            }
        }
        return BusinessConfigOpfabServicesInterface.configCache.get(key);
    }

    public async fetchTemplate(processId: string, emailBodyTemplate: string, version: string): Promise<Function> {
        const key = processId + '.' + version;
        const cachedMap = BusinessConfigOpfabServicesInterface.templateCompilerCache.get(key);
        if (cachedMap != null) {
            if (!cachedMap.has(emailBodyTemplate)) {
                await this.addTemplateToCache(processId, emailBodyTemplate, version, key);
            }
        } else {
            await this.addTemplateToCache(processId, emailBodyTemplate, version, key);
        }

        const compiler = BusinessConfigOpfabServicesInterface.templateCompilerCache.get(key)?.get(emailBodyTemplate);
        if (compiler != null) {
            return compiler;
        } else {
            return () => {
                return null;
            };
        }
    }

    private async addTemplateToCache(
        processId: string,
        emailBodyTemplate: string,
        version: string,
        key: string
    ): Promise<void> {
        const cachedMap: Map<string, Function> | undefined = new Map();
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
            if (response?.data != null) {
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
            if (response?.data != null) {
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

    async sendGetProcessConfigRequest(processId: string, version: string): Promise<any> {
        let url = this.opfabBusinessconfigUrl + '/businessconfig/processes/' + processId;
        if (version != null) {
            url = url + '?version=' + version;
        }
        return this.sendRequest({
            method: 'get',
            url,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    async sendGetTemplateRequest(processId: string, templateName: string, version: string): Promise<any> {
        let url = this.opfabBusinessconfigUrl + '/businessconfig/processes/' + processId + '/templates/' + templateName;
        if (version != null) {
            url = url + '?version=' + version;
        }
        return this.sendRequest({
            method: 'get',
            url,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }
}
