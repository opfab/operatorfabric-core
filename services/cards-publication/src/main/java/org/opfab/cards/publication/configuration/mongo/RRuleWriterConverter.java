/*Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/



package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.model.DayEnum;
import org.opfab.cards.model.FreqEnum;
import org.opfab.cards.publication.model.*;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

public class RRuleWriterConverter implements Converter<RRule, Document> {

    @Override
    public Document convert(RRule source) {
        Document result = new Document();

        FreqEnum freq = source.getFreq();
        if (freq != null) {
            result.append("freq", freq);
        }

        Integer count = source.getCount();
        if (count != null) {
            result.append("count", count);
        }

        Integer interval = source.getInterval();
        if (interval != null) {
            result.append("interval", interval);
        }

        DayEnum wkst = source.getWkst();
        if (wkst != null) {
            result.append("wkst", wkst);
        }

        List<DayEnum> byweekday = source.getByweekday();
        if (byweekday != null)
            result.append("byweekday", byweekday);

        List<Integer> bymonth = source.getBymonth();
        if (bymonth != null)
            result.append("bymonth", bymonth);

        List<Integer> byhour = source.getByhour();
        if (byhour != null)
            result.append("byhour", byhour);

        List<Integer> byminute = source.getByminute();
        if (byminute != null)
            result.append("byminute", byminute);

        List<Integer> bysetpos = source.getBysetpos();
        if (bysetpos != null)
            result.append("bysetpos", bysetpos);

        List<Integer> bymonthday = source.getBymonthday();
        if (bymonthday != null)
            result.append("bymonthday", bymonthday);

        String tzid = source.getTzid();
        if (tzid != null) {
            result.append("tzid", tzid);
        }

        Integer durationInMinutes = source.getDurationInMinutes();
        if (durationInMinutes != null) {
            result.append("durationInMinutes", durationInMinutes);
        }

        return result;
    }
}
