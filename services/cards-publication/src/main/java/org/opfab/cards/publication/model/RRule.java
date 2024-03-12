/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import lombok.*;
import org.springframework.validation.annotation.Validated;
import java.util.List;

@Builder
@Validated
public record RRule(FreqEnum freq, Integer count, Integer interval,
        DayEnum wkst, List<DayEnum> byweekday, List<Integer> bymonth,
        List<Integer> byhour, List<Integer> byminute, List<Integer> bysetpos,
        List<Integer> bymonthday, String tzid, Integer durationInMinutes) {
    public RRule {
        if (interval == null) {
            interval = 1;
        }
        if (wkst == null) {
            wkst = DayEnum.MO;
        }
        if (tzid == null) {
            tzid = "Europe/Paris";
        }
    }
}
