/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import org.opfab.client.avro.CardCommand;
import org.opfab.client.avro.CommandType;

public interface CommandHandler {

    CommandType getCommandType();

    void executeCommand(CardCommand cardCommand);
}
