/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
public class RecurrencePublicationData implements Recurrence {

    private String timeZone = "Europe/Paris";
    private List<Integer> daysOfWeek;
    List<? extends HoursAndMinutes> hoursAndMinutes;

    public  RecurrencePublicationData(String timeZone,List<Integer> daysOfWeek, List<? extends HoursAndMinutes> hoursAndMinutes)
    {
        if (this.timeZone !=null) this.timeZone = timeZone ;
        this.daysOfWeek = daysOfWeek;
        this.hoursAndMinutes = hoursAndMinutes; 
    }

}
