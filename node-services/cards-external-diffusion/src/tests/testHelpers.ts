/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import SendMailService from '../domain/server-side/sendMailService';
import GetResponse from '../common/server-side/getResponse';
import Handlebars from 'handlebars';
import CardsExternalDiffusionOpfabServicesInterface from '../domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsExternalDiffusionDatabaseService from '../domain/server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from '../domain/server-side/BusinessConfigOpfabServicesInterface';
import {format} from 'date-fns';

export class OpfabServicesInterfaceStub extends CardsExternalDiffusionOpfabServicesInterface {
    public isResponseValid = true;

    card: any;
    allUsers = new Array<any>();

    usersWithPerimeters = new Array<any>();

    async getCard(): Promise<GetResponse> {
        return new GetResponse(this.card, this.isResponseValid);
    }

    public getUsers(): any[] {
        return this.allUsers;
    }

    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        const foundIndex = this.usersWithPerimeters.findIndex((u) => u.userData.login === login);
        return new GetResponse(foundIndex >= 0 ? this.usersWithPerimeters[foundIndex] : null, true);
    }

    public async getEntity(entityId: string): Promise<GetResponse> {
        return new GetResponse({id: entityId, name: entityId + ' name'}, this.isResponseValid);
    }
}

export class OpfabBusinessConfigServicesInterfaceStub extends BusinessConfigOpfabServicesInterface {
    public isResponseValid = true;
    config: any;
    template: string;

    async fetchProcessConfig(): Promise<GetResponse> {
        return this.config;
    }

    async fetchTemplate(): Promise<Function> {
        return Handlebars.compile(this.template);
    }
}

export class SendMailServiceStub extends SendMailService {
    numberOfMailsSent = 0;
    sent: any[] = [];

    public async sendMail(subject: string, body: string, from: string, to: string): Promise<any> {
        if (to.indexOf('@') > 0) {
            this.numberOfMailsSent++;

            this.sent.push({
                fromAddress: from,
                toAddress: to,
                subject,
                body
            });

            return {messageId: 'msg1234'};
        } else throw new Error();
    }
}

export class DatabaseServiceStub extends CardsExternalDiffusionDatabaseService {
    sent: any[] = [];
    cards = new Array<any>();

    public async getCards(publishDate: number): Promise<any[]> {
        return this.cards.filter((card) => card.publishDate >= publishDate);
    }

    public async getSentMail(cardUid: string, email: string): Promise<any> {
        return this.sent.find((sentmail) => sentmail.cardUid === cardUid && sentmail.email === email);
    }

    public async persistSentMail(cardUid: string, email: string): Promise<void> {
        this.sent.push({cardUid, email, date: Date.now()});
    }

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteMailsSentBefore(dateLimit: number): Promise<void> {}
}

export function getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined): string {
    if (epochDate == null || epochDate === undefined) {
        return '';
    }
    return format(epochDate, 'dd/MM/yyyy HH:mm');
}
