/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EntityToSupervise} from '../application/entityToSupervise';

export default class ConfigDTO {
    public secondsBetweenConnectionChecks = 0;
    public nbOfConsecutiveNotConnectedToSendFirstCard = 0;
    public nbOfConsecutiveNotConnectedToSendSecondCard = 0;
    public considerConnectedIfUserInGroups: string[] = [];
    public entitiesToSupervise: EntityToSupervise[] = [];
    public processesToSupervise: string[] = [];
    public windowInSecondsForCardSearch: number;
    public secondsBetweenAcknowledgmentChecks = 0;
    public secondsAfterPublicationToConsiderCardAsNotAcknowledged: number;
    public disconnectedCardTemplate: string;
    public unackCardTemplate: string;
}
