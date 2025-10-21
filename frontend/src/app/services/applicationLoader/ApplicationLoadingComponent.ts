/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class ApplicationLoadingComponent {
    private resolve;

    public async execute(): Promise<boolean> {
        // implement here the step execution
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    protected setAsFinishedWithoutError(): void {
        this.resolve(true);
    }

    protected setAsFinishedWithError(): void {
        this.resolve(false);
    }
}
