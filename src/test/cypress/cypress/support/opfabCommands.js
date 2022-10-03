
/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
export class OpfabCommands {
    name; 

    init(name) {
        this.name = name;
        this.addCodeToLogInAllMethods();
    }

    addCodeToLogInAllMethods() {
        Reflect.ownKeys(this).forEach(key => {
            if (this[key].prototype) {
                this.addCodeToLogInMethod(key);
            }
        })
    }

    addCodeToLogInMethod(methodName) {
        const oldMethod = Reflect.getOwnPropertyDescriptor(this, methodName);

        const newMethod = function (...args) {
            cy.log(' ---- ', (new Date()).toISOString(), name, methodName, args.toString(), ' ----');
            oldMethod.value.call(this, ...args);
        }
        Reflect.defineProperty(this, methodName, {value: newMethod});

    }

}
