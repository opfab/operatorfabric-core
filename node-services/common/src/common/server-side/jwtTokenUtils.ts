/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Request} from 'express';
import {jwtDecode} from 'jwt-decode';


export default class JwtTokenUtils {

    logger: any;

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public getRequestToken(req: Request) : string | null {
        let res = null;
        if (req.headers.authorization) {
            res = req.headers.authorization.split(' ')[1]; 
        }
        return res;
    }

    public validateToken(token: string, margin: number) : boolean {
        if (token) {
            const jwt = this.decodeToken(token);

            if (jwt) {
                const expirationDate = jwt['exp'];
                if (new Date().valueOf() < (expirationDate * 1000) - margin) {
                    return true;
                }
            }
        }
        return false;
    }


    private decodeToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (error) {
            if (this.logger) this.logger.error("Error decoding token", error);
            return null;
        }
    }
}

