/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {StateExclusion} from '@ofServices/customScreen/model/CustomScreenDefinition';

export class FilterValues {
    public startDate: number;
    public endDate: number;
    public processes: string[];
    public typesOfStateFilter: string[];
    public statesToExcludeFilter: StateExclusion[];
    public readAndAckFilter: string[];
    public includeCardsWithResponseFromMyEntities: boolean;
    public includeCardsWithResponsesFromAllEntities: boolean;
    public includeOnlyCardsEmittedByCurrentUserEntities: boolean;
}
