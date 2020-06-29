/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Card} from "@ofModel/card.model";
import {UserContext} from "@ofModel/user-context.model";
import { ThirdResponse } from './thirds.model';

export class DetailContext{
    constructor(
        readonly card: Card,
        readonly childCards: Card[],
        readonly userContext: UserContext,
        readonly responseData: ThirdResponse) {}
}