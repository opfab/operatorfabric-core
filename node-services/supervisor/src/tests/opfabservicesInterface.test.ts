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
import OpfabServicesInterface from '../common/server-side/opfabServicesInterface';
import {getLogger} from '../common/server-side/logger';

const logger = getLogger();

function getOpfabServicesInterface(): OpfabServicesInterface {
    return new OpfabServicesInterface()
        .setLogin('test')
        .setPassword('test')
        .setOpfabGetTokenUrl('tokenurl')
        .setOpfabUsersUrl('test')
        .setOpfabCardsConsultationUrl('test')
        .setLogger(logger);
}

describe('Opfab interface', function () {
    it('Should get one user login when one user connected ', async function () {
        const opfabServicesInterface = getOpfabServicesInterface();
        sinon.stub(opfabServicesInterface, 'sendRequest').callsFake(async (request) => {
            if ((request.url as string).includes('token')) return {status: 200, data: {access_token: 'fakeToken'}};
            else if ((request.headers?.Authorization as string).includes('Bearer fakeToken'))
                return {status: 200, data: [{login: 'user1'}]};
            else return {status: 400};
        });
        const GetResponse = await opfabServicesInterface.getUsersConnected();
        expect(GetResponse.isValid()).toBe(true);
        expect(GetResponse.getData().length).toEqual(1);
    });

    it('Should return invalid response when impossible to authenticate to opfab ', async function () {
        const opfabServicesInterface = getOpfabServicesInterface();
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        sinon.stub(opfabServicesInterface, 'sendRequest').callsFake(async (request: any) => {
            throw new Error('test');
        });
        const GetResponse = await opfabServicesInterface.getUsersConnected();
        expect(GetResponse.isValid()).toBe(false);
    });

    it('Should return invalid response when error in user request', async function () {
        const opfabServicesInterface = getOpfabServicesInterface();
        sinon.stub(opfabServicesInterface, 'sendRequest').callsFake(async (request) => {
            if ((request.url as string).includes('token')) return {status: 200, data: {access_token: 'fakeToken'}};
            else throw new Error('error message');
        });
        const GetResponse = await opfabServicesInterface.getUsersConnected();

        expect(GetResponse.isValid()).toBe(false);
    });
});
