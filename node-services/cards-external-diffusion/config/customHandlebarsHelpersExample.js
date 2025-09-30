/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

// This is an example file
// Do not use in production

function example_severityColor(severity) {
    let color;
    switch (severity) {
        case 'ALARM':
            color = 'red';
            break;
        case 'ACTION':
            color = 'orange';
            break;
        case 'COMPLIANT':
            color = 'green';
            break;
        case 'INFORMATION':
            color = 'blue';
            break;
        default:
            color = 'white';
            break;
    }
    return color;
}
// SonarCloud complain with : Add the "let", "const" or "var" keyword to this declaration of "helpers" to make it explicit.
// but it is an existing variable in the scope where this file is included
// eslint-disable-next-line no-undef
helpers = [example_severityColor]; //NOSONAR
