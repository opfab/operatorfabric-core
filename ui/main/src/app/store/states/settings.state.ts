/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


export interface SettingsState{
    settings:any,
    loading: boolean,
    loaded: boolean,
    error: string
}

export const settingsInitialState: SettingsState = {
    settings:{},
    loading: false,
    loaded: false,
    error: null
}