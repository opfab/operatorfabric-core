/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import OutgoingEmailsServer from '../domain/server-side/outgoingEmailsServer';
import GetResponse from '../common/server-side/getResponse';
import Handlebars from 'handlebars';
import UsersServer from '../domain/server-side/usersServer';
import DatabaseServer from '../domain/server-side/databaseServer';
import BusinessConfigServer from '../domain/server-side/businessConfigServer';
import {format} from 'date-fns';
import {LightCard} from '../domain/model/lightCard';
import {Card} from '../domain/model/card';

export class OpfabServicesInterfaceStub extends UsersServer {
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

export class OpfabBusinessConfigServicesInterfaceStub extends BusinessConfigServer {
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

export class SendMailServiceStub extends OutgoingEmailsServer {
    numberOfMailsSent = 0;
    sent: any[] = [];

    public async sendMail(subject: string, body: string, attachment: any[], from: string, to: string): Promise<any> {
        this.numberOfMailsSent++;

        this.sent.push({
            fromAddress: from,
            toAddress: to,
            subject,
            body
        });

        return {messageId: 'msg1234'};
    }
}

export class DatabaseServiceStub extends DatabaseServer {
    sent: any[] = [];
    cards = new Array<Card>();

    public async getCards(publishDate: number): Promise<LightCard[]> {
        return this.cards
            .filter((card) => card.publishDate >= publishDate)
            .map((card) => ({
                id: card.id,
                uid: card.uid,
                processVersion: card.processVersion,
                process: card.process,
                state: card.state,
                titleTranslated: card.titleTranslated,
                summaryTranslated: card.summaryTranslated,
                publishDate: card.publishDate,
                usersReads: card.usersReads,
                startDate: card.startDate,
                endDate: card.endDate,
                userRecipients: card.userRecipients,
                groupRecipients: card.groupRecipients,
                entityRecipients: card.entityRecipients,
                publisher: card.publisher,
                publisherType: card.publisherType,
                severity: card.severity
            }));
    }

    public async getCard(cardUid: string): Promise<any> {
        const card = this.cards.find((c) => c.uid === cardUid);

        if (!card) {
            return null;
        }

        return {
            id: card.id,
            uid: card.uid,
            processVersion: card.processVersion,
            process: card.process,
            state: card.state,
            titleTranslated: card.titleTranslated,
            summaryTranslated: card.summaryTranslated,
            publishDate: card.publishDate,
            usersReads: card.usersReads,
            startDate: card.startDate,
            endDate: card.endDate,
            userRecipients: card.userRecipients,
            groupRecipients: card.groupRecipients,
            entityRecipients: card.entityRecipients,
            publisher: card.publisher,
            publisherType: card.publisherType,
            severity: card.severity,
            data: card.data
        };
    }

    public async getSentMail(cardUid: string, email: string): Promise<any> {
        return this.sent.find((sentmail) => sentmail.cardUid === cardUid && sentmail.email === email);
    }

    public async persistSentMail(cardUid: string, email: string): Promise<void> {
        this.sent.push({cardUid, email, date: Date.now()});
    }

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteMailsSentBefore(dateLimit: number): Promise<void> {
        // No implementation needed for the stub
    }
}

export function getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined): string {
    if (epochDate == null || epochDate === undefined) {
        return '';
    }
    return format(epochDate, 'dd/MM/yyyy HH:mm');
}
