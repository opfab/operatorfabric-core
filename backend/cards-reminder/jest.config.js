/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
module.exports = {
    preset: 'ts-jest',
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts}',
        '!src/tests/**/*.{js,ts}', // Exclude test directory
        '!src/domain/server-side/**/*.{js,ts}', // Exclude server-side directory that is tested via integration tests
        '!src/cardsReminder.ts' // Exclude cards reminder entry point that is tested via integration tests
    ],
    testEnvironment: 'node'
};
