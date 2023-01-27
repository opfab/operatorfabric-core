/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.spies;

import java.util.ArrayList;
import java.util.List;

import org.opfab.users.services.EventBus;

public class EventBusSpy implements EventBus {



    private List<String[]>  messagesSent = new ArrayList<>();


    @Override
    public void sendEvent(String eventKey, String eventMessage) {
        String[] event = {eventKey,eventMessage};
        messagesSent.add(event);
    }

    public List<String[]> getMessagesSent() {
        return new ArrayList<>(messagesSent);
    }
    
}
