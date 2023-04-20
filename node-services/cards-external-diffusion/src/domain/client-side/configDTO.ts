
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export default class ConfigDTO {

    public mailFrom : string;
    public subjectPrefix : string;
    public bodyPrefix : string;
    public windowInSecondsForCardSearch = 0;
    public secondsAfterPublicationToConsiderCardAsNotRead = 0;
    public checkPeriodInSeconds = 0;
}