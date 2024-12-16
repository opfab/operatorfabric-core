/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Notification {
    constructor(readonly opfabSignalId: string) {}
}

export class UserConfiguration {
    public constructor(
        readonly userLogin: string,
        readonly externalDeviceIds: string[]
    ) {}
}

export class DeviceConfiguration {
    public constructor(
        readonly id: string,
        readonly host: string,
        readonly port: number,
        readonly signalMappingId: string,
        readonly isEnabled: boolean
    ) {}
}

export class SignalMapping {
    public constructor(
        readonly id: string,
        readonly supportedSignals: Map<string, number>
    ) {}
}
