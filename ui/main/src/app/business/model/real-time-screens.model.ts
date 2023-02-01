/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class RealTimeScreens {
    public constructor(readonly realTimeScreens: Array<RealTimeScreen>) {}
}

export class RealTimeScreen {
    constructor(readonly screenName: string, readonly screenColumns: Array<ScreenColumn>) {}
}

export class ScreenColumn {
    constructor(readonly entitiesGroups: Array<EntitiesGroups>) {}
}

export class EntitiesGroups {
    constructor(readonly name: string, readonly entities: Array<string>, readonly groups: Array<string>) {}
}
