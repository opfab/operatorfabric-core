/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
export default class OperationResult<T> {
    private _result: T | undefined;
    private _error: Error | undefined;

    constructor(result: T | undefined, error: Error | undefined) {
        this._result = result;
        this._error = error;
    }

    get result(): T | undefined {
        return this._result;
    }

    get error(): Error | undefined {
        return this._error;
    }

    get hasError(): boolean {
        return this._error != undefined;
    }

    static success<T>(result: T): OperationResult<T> {
        return new OperationResult<T>(result, undefined);
    }

    static error<T>(error: Error): OperationResult<T> {
        return new OperationResult<T>(undefined, error);
    }
}
