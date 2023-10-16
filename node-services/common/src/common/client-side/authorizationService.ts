/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Request} from 'express';
import OpfabServicesInterface from '../server-side/opfabServicesInterface';
import JwtTokenUtils from '../util/jwtTokenUtils';

export default class AuthorizationService {

    opfabServicesInterface: OpfabServicesInterface;
    jwtToken: JwtTokenUtils = new JwtTokenUtils();
    logger: any;


    public setLogger(logger: any) {
        this.logger = logger;
        this.jwtToken.setLogger(logger);
        return this;
    }

    public setOpfabServicesInterface(opfabServicesInterface: OpfabServicesInterface) {
        this.opfabServicesInterface = opfabServicesInterface;
        return this;
    }

    public async isAdminUser(req: Request) {
        const token = this.jwtToken.getRequestToken(req);

        const res = await this.opfabServicesInterface.getUserWithPerimeters(token).then(userResp => {
            this.logger.debug("Got user data " + JSON.stringify(userResp.getData()));
            return this.hasUserAnyPermission(userResp.getData(), ['ADMIN'])
    
        });
        return res;
    }


    public hasUserAnyPermission(user: any, permissions: string[]): boolean {
        if (!user || !permissions) return false;
        return (
            user.permissions?.filter((permission: string) => permissions.includes(permission)).length > 0
        );
    }


}

