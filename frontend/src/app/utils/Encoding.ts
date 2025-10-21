/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export function base64urlEncode(str: string) {
    const base64 = btoa(str);
    // Replace '+' with '-', '/' with '_' and remove trailing '=' to convert base64 to base64url
    let base64url = base64.replace(/\+/g, '-').replace(/\//g, '_');
    while (base64url.endsWith('=')) {
        base64url = base64url.slice(0, base64url.length - 1);
    }
    return base64url;
}
export function base64urlDecode(str: string) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
}
