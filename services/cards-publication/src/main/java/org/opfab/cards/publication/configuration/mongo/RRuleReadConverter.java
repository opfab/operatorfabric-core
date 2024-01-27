/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.publication.model.DayEnum;
import org.opfab.cards.publication.model.FreqEnum;
import org.opfab.cards.publication.model.RRule;
import org.springframework.core.convert.converter.Converter;

import java.util.ArrayList;
import java.util.List;


public class RRuleReadConverter implements Converter<Document, RRule> {

    @Override
    public RRule convert(Document source) {

        List<DayEnum> byweekdayEnumList = new ArrayList<>();

        FreqEnum freq = FreqEnum.valueOf(source.getString("freq"));
        Integer count = source.getInteger("count");
        Integer interval = source.getInteger("interval");
        DayEnum wkst = DayEnum.valueOf(source.getString("wkst"));
        Integer durationInMinutes = source.getInteger("durationInMinutes");

        List<String> byweekdayStringList = source.getList("byweekday", String.class);
        if (byweekdayStringList != null) {
            for (String byweekdayString : byweekdayStringList) {
                byweekdayEnumList.add(DayEnum.valueOf(byweekdayString));
            }
        }

        List<Integer> bymonth = source.getList("bymonth", Integer.class);
        List<Integer> byhour = source.getList("byhour", Integer.class);
        List<Integer> byminute = source.getList("byminute", Integer.class);
        List<Integer> bysetpos = source.getList("bysetpos", Integer.class);
        List<Integer> bymonthday = source.getList("bymonthday", Integer.class);

        String tzid = source.getString("tzid");

        RRule.RRuleBuilder builder = RRule.builder()
                .freq(freq)
                .count(count)
                .interval(interval)
                .wkst(wkst)
                .byweekday(byweekdayEnumList)
                .bymonth(bymonth)
                .byhour(byhour)
                .byminute(byminute)
                .bysetpos(bysetpos)
                .bymonthday(bymonthday)
                .tzid(tzid)
                .durationInMinutes(durationInMinutes)
                ;

        return builder.build();
    }
}
