/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Request, Response} from 'express';
import OpfabServicesInterface from './opfabServicesInterface';
import JwtTokenUtils from './jwtTokenUtils';

export default class AuthorizationService {
    opfabServicesInterface: OpfabServicesInterface;
    jwtToken: JwtTokenUtils = new JwtTokenUtils();
    logger: any;
    loginClaim = 'sub';

    public setLogger(logger: any): this {
        this.logger = logger;
        this.jwtToken.setLogger(logger);
        return this;
    }

    public setOpfabServicesInterface(opfabServicesInterface: OpfabServicesInterface): this {
        this.opfabServicesInterface = opfabServicesInterface;
        return this;
    }

    public setLoginClaim(loginClaim: string): this {
        this.loginClaim = loginClaim;
        return this;
    }

    public async isAdminUser(req: Request): Promise<boolean> {
        const token = this.jwtToken.getRequestToken(req);

        const res = await this.opfabServicesInterface.getUserWithPerimeters(token).then((userResp) => {
            this.logger.debug('Got user data ' + JSON.stringify(userResp.getData()));
            return this.hasUserAnyPermission(userResp.getData(), ['ADMIN']);
        });
        return res;
    }

    public handleUnauthorizedAccess(req: Request, res: Response): void {
        const username = this.jwtToken.getUser(this.jwtToken.getRequestToken(req), this.loginClaim);
        this.logger.warn(
            'SECURITY : user ' +
                username +
                ' try to access resource ' +
                req.originalUrl +
                ' without the required authorization'
        );
        res.status(403).send();
    }

    private hasUserAnyPermission(user: any, permissions: string[]): boolean {
        if (user == null || permissions == null) return false;
        return user.permissions?.filter((permission: string) => permissions.includes(permission)).length > 0;
    }
}
