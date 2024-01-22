/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import fs from 'fs';

export function loadTestBundle(version: number): any {
    const bundle = fs.readFileSync(`./tests/data/testBundleV${version}.tar.gz`);
    return bundle;
}

export function loadAnotherTestBundle(): any {
    const bundle = fs.readFileSync('./tests/data/anotherBundle.tar.gz');
    return bundle;
}

export function loadInvalidBundle(): any {
    const bundle = fs.readFileSync('./tests/data/invalidBundle.tar.gz');
    return bundle;
}