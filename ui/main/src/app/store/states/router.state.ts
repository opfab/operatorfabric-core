/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


/*
* following configuration initialize the state of router in order to enable the currentUrl in app.component.ts
* source: https://github.com/ngrx/platform/issues/835
*/
export const initialState = {
    state: {
        url: window.location.pathname,
        params: {},
        queryParams: {}
    },
    navigationId: 0
}