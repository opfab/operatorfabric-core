
/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class externalCommands {
    constructor(commandGroupName) {
        this.commandGroupName = commandGroupName;
    }

    addCommand(command, funct) {
        this[command] = function () {
            let args = '';
            Array.prototype.slice.call(arguments).forEach((element) => (args += ' - ' + element));
            cy.log(' ---- ', (new Date()).toISOString() ,this.commandGroupName, command, args, ' ----');
            funct.call(this, ...arguments);
        };
    }
}
