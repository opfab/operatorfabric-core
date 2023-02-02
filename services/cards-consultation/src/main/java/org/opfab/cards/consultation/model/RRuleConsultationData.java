/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opfab.cards.model.DayEnum;
import org.opfab.cards.model.FreqEnum;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RRuleConsultationData implements RRule {

    private FreqEnum freq;
    private Integer count;
    private Integer interval;
    private DayEnum wkst;
    private List<DayEnum> byweekday;
    private List<Integer> bymonth;
    private List<Integer> byhour;
    private List<Integer> byminute;
    private List<Integer> bysetpos;
    private List<Integer> bymonthday;
    private String tzid;
}
