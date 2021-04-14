/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.publication.model.HoursAndMinutes;
import org.lfenergy.operatorfabric.cards.publication.model.HoursAndMinutesPublicationData;

public  class  HoursAndMinutesReadConverter {


    private HoursAndMinutesReadConverter() {
        throw new IllegalStateException("Utility class");
      }

    public static HoursAndMinutes convert(Document source) {
        Integer hours = source.getInteger("hours");
        Integer minutes = source.getInteger("minutes");

        return new HoursAndMinutesPublicationData(hours,minutes);
    }
}
