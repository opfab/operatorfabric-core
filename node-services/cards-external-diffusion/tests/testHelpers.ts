/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import SendMailService from '../src/domain/server-side/sendMailService';
import GetResponse from '../src/common/server-side/getResponse';
import Handlebars from 'handlebars';
import CardsExternalDiffusionOpfabServicesInterface from '../src/domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsExternalDiffusionDatabaseService from '../src/domain/server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from '../src/domain/server-side/BusinessConfigOpfabServicesInterface';


export class OpfabServicesInterfaceStub extends CardsExternalDiffusionOpfabServicesInterface {
    public isResponseValid = true;

    card: any;
    allUsers: Array<any> = new Array();
    connectedUsers: Array<any> = new Array();

    usersWithPerimeters: Array<any> = new Array();

    async getCard() {
        return new GetResponse(this.card, this.isResponseValid);
    }

    public getUsers() {
        return this.allUsers;
    }

    public async getUsersConnected(): Promise<GetResponse> {
        return new GetResponse(this.connectedUsers, this.isResponseValid);
    }

    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        const foundIndex = this.usersWithPerimeters.findIndex((u) => u.userData.login === login);
        return new GetResponse(foundIndex >= 0 ? this.usersWithPerimeters[foundIndex] : null, true);
    }
}

export class OpfabBusinessConfigServicesInterfaceStub extends BusinessConfigOpfabServicesInterface {
    public isResponseValid = true;
    config: any;
    template: string;

    async fetchProcessConfig() {
        return this.config;
    }

    async fetchTemplate() {
        return Handlebars.compile(this.template);
    }
}

export class SendMailServiceStub extends SendMailService {
    numberOfMailsSent = 0;
    sent: Array<any> = [];

    public async sendMail(subject: string, body: string, from: string, to: string) {
        if (to.indexOf('@') > 0) {
            this.numberOfMailsSent++;

            this.sent.push({
                fromAddress: from,
                toAddress: to,
                subject: subject,
                body: body
            });

            return Promise.resolve({messageId: 'msg1234'});
        } else return Promise.reject(new Error());
    }
}

export class DatabaseServiceStub extends CardsExternalDiffusionDatabaseService {
    sent: Array<any> = [];
    cards: Array<any> = new Array();

    public async getCards() {
        return this.cards;
    }

    public async getSentMail(cardUid: string, email: string) {
        const found = this.sent.find((sentmail) => sentmail.cardUid == cardUid && sentmail.email == email);
        return Promise.resolve(found);
    }

    public async persistSentMail(cardUid: string, email: string): Promise<void> {
        this.sent.push({cardUid: cardUid, email: email, date: Date.now()});
        return Promise.resolve();
    }

    public async deleteMailsSentBefore(dateLimit: number) {
        return Promise.resolve();
    }
}