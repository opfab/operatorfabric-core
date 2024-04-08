/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import {Card} from '../../domain/application/card';

export class OpfabServicesInterfaceStub extends OpfabServicesInterface {
    public numberOfCardSend = 0;
    public isResponseValid = true;
    public cardSend: Card;

    private getEntityFunc: (id: string) => GetResponse = (id: string) => {
        return new GetResponse({id, name: id + ' Name'}, true);
    };

    public setGetEntityFunction(getEntityFunct: (id: string) => GetResponse): void {
        this.getEntityFunc = getEntityFunct;
    }

    public userConnected = new Array<any>();

    async getUsersConnected(): Promise<GetResponse> {
        return new GetResponse(this.userConnected, this.isResponseValid);
    }

    public async getEntity(id: string): Promise<GetResponse> {
        return this.getEntityFunc(id);
    }

    async sendCard(card: Card): Promise<void> {
        this.numberOfCardSend++;
        this.cardSend = card;
    }
}
