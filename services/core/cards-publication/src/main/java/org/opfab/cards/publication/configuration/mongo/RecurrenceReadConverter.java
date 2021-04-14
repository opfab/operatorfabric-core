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
import org.lfenergy.operatorfabric.cards.publication.model.Recurrence;
import org.lfenergy.operatorfabric.cards.publication.model.RecurrencePublicationData;

import java.util.List;



public class RecurrenceReadConverter {

    private RecurrenceReadConverter() {
        throw new IllegalStateException("Utility class");
      }

    public static Recurrence convert(Document source) {
        String timeZone= source.getString("timeZone");
        List<Integer> daysOfWeek = (List<Integer>) source.get("daysOfWeek");
        Document hoursAndMinutes = (Document) source.get("hoursAndMinutes");
        Integer durationInMinutes = source.getInteger("durationInMinutes");

        RecurrencePublicationData.RecurrencePublicationDataBuilder builder = RecurrencePublicationData.builder()
                .timeZone(timeZone)
                .daysOfWeek(daysOfWeek)
                .hoursAndMinutes(HoursAndMinutesReadConverter.convert(hoursAndMinutes))
                .durationInMinutes(durationInMinutes)
                ;
                
        return builder.build();
    }
}
