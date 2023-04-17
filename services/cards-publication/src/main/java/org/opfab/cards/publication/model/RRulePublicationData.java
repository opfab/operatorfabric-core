/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.model;

import lombok.*;

import org.opfab.cards.model.FreqEnum;
import org.opfab.cards.model.DayEnum;

import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>RRule Model, documented at {@link RRule}</p>
 * <p>
 * {@inheritDoc}
 *
 *
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RRulePublicationData implements RRule {

    private FreqEnum freq;
    private Integer count;
    @Builder.Default
    private Integer interval = 1;

    @Builder.Default
    private DayEnum wkst = DayEnum.MO;
    private List<DayEnum> byweekday;
    private List<Integer> bymonth;
    private List<Integer> byhour;
    private List<Integer> byminute;
    private List<Integer> bysetpos;
    private List<Integer> bymonthday;
    @Builder.Default
    private String tzid = "Europe/Paris";
    private Integer durationInMinutes;
}
