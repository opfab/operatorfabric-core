/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ThirdMenu} from "@ofModel/thirds.model";

export interface MenuState{
    menu: ThirdMenu[],
    loading: boolean,
    error:string
}

export const menuInitialState: MenuState = {
    menu:[],
    loading: false,
    error:null
}