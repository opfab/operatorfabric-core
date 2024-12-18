/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process, State} from '@ofServices/processes/model/Processes';

export function getProcessConfigWith(nbProcess: number, nbStatePerProcess: number): Process[] {
    const processes: Process[] = [];
    for (let i = 0; i < nbProcess; i++) {
        const states = new Map<string, State>();
        for (let j = 0; j < nbStatePerProcess; j++) {
            states.set(`state${i}_${j}`, {name: `State ${i}_${j}`, userCard: {}});
        }
        processes.push({
            id: `process${i}`,
            version: 'v1',
            name: `process name ${i}`,
            states
        });
    }
    return processes;
}

declare const opfab: any;
export function setSpecificCardInformation(specificCardInformation: any) {
    opfab.currentUserCard.registerFunctionToGetSpecificCardInformation(() => {
        return specificCardInformation;
    });
}
