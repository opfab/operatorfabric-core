/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ApplicationRouter} from '@ofServices/navigation/router/ApplicationRouter';

export class ApplicationRouterMock extends ApplicationRouter {
    private navigationStartCallback: (route: string) => void = () => {};
    private navigationEndCallback: (route: string) => void = () => {};

    listenForNavigationStart(callback: (route: string) => void) {
        this.navigationStartCallback = callback;
    }
    listenForNavigationEnd(callback: (route: string) => void) {
        this.navigationEndCallback = callback;
    }
    public urlCalled: string;

    navigateTo(url: string) {
        this.urlCalled = url;
        this.navigationStartCallback(url);
        this.navigationEndCallback(url);
    }

    getCurrentRoute(): string {
        return this.urlCalled;
    }
}
