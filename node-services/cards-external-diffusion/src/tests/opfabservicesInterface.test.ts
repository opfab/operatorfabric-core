/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import sinon from 'sinon';
import {getLogger} from '../common/server-side/logger';
import CardsExternalDiffusionOpfabServicesInterface from '../domain/server-side/cardsExternalDiffusionOpfabServicesInterface';

function getOpfabServicesInterface(): CardsExternalDiffusionOpfabServicesInterface {
    return new CardsExternalDiffusionOpfabServicesInterface()
        .setLogin('test')
        .setPassword('test')
        .setOpfabGetTokenUrl('tokenurl')
        .setOpfabUsersUrl('test')
        .setOpfabCardsConsultationUrl('test')
        .setLogger(logger);
}

const logger = getLogger();

describe('Opfab interface', function () {
    it('Should return invalid response when impossible to authenticate to opfab ', async function () {
        const opfabServicesInterface = getOpfabServicesInterface();
        //eslint-disable-next-line  @typescript-eslint/no-unused-vars
        sinon.stub(opfabServicesInterface, 'sendRequest').callsFake(async (request: any) => {
            throw new Error('test');
        });
        const GetResponse = await opfabServicesInterface.getUsersConnected();
        expect(GetResponse.isValid()).toBe(false);
    });

    it('Should return invalid reponse  when error in user request ', async function () {
        const opfabServicesInterface = getOpfabServicesInterface();
        sinon.stub(opfabServicesInterface, 'sendRequest').callsFake(async (request) => {
            if (request.url.includes('token') === true) return {status: 200, data: {access_token: 'fakeToken'}};
            else throw new Error('error message');
        });
        const GetResponse = await opfabServicesInterface.getUsersConnected();
        expect(GetResponse.isValid()).toBe(false);
    });
});
