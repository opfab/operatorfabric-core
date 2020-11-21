/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.cards.publication.model.RecurrencePublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.HoursAndMinutes;
import org.lfenergy.operatorfabric.cards.publication.model.HoursAndMinutesPublicationData;


import java.util.List;
import java.util.stream.Collectors;

public class RecurrenceWriterConverter { 

    private static String defaultTimeZone = "Europe/Paris";

    private RecurrenceWriterConverter() {
        throw new IllegalStateException("Utility class");
      }


    public static Document convert(RecurrencePublicationData source) {
        Document result = new Document();
        HoursAndMinutes  hoursAndMinutes = source.getHoursAndMinutes();
        if (hoursAndMinutes!=null) {
            result.append("hoursAndMinutes", HoursAndMinutesWriterConverter.convert((HoursAndMinutesPublicationData) hoursAndMinutes));
        }

        List<Integer>  daysOfWeek = source.getDaysOfWeek();
        if (daysOfWeek!=null) result.append("daysOfWeek",daysOfWeek);

        String timeZone = source.getTimeZone();
        if ((timeZone==null)||timeZone.equals("")) timeZone = defaultTimeZone;
        result.append("timeZone", timeZone);

        return result;

    }

}
