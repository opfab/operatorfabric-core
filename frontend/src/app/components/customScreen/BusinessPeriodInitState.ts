/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/**
 * Holds in-memory state shared between Dashboard and CustomCardList screens
 * to track whether the FROM_TODAY_TO_YEAR_END initial business period has already been applied.
 *
 * Using a static in-memory variable (instead of sessionStorage) ensures the state
 * is automatically reset on every page reload (F5), while persisting for the lifetime
 * of the current page session.
 */
export class BusinessPeriodInitState {
    private static _fromTodayToYearEndDeactivated = false;

    static get fromTodayToYearEndDeactivated(): boolean {
        return BusinessPeriodInitState._fromTodayToYearEndDeactivated;
    }

    static deactivate(): void {
        BusinessPeriodInitState._fromTodayToYearEndDeactivated = true;
    }

    static reset(): void {
        BusinessPeriodInitState._fromTodayToYearEndDeactivated = false;
    }
}
