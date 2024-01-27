/*Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

package org.opfab.cards.publication.configuration.mongo;

import org.bson.Document;
import org.opfab.cards.publication.model.*;
import org.springframework.core.convert.converter.Converter;

import java.util.List;

public class RRuleWriterConverter implements Converter<RRule, Document> {

    @Override
    public Document convert(RRule source) {
        Document result = new Document();

        FreqEnum freq = source.freq();
        if (freq != null) {
            result.append("freq", freq);
        }

        Integer count = source.count();
        if (count != null) {
            result.append("count", count);
        }

        Integer interval = source.interval();
        if (interval != null) {
            result.append("interval", interval);
        }

        DayEnum wkst = source.wkst();
        if (wkst != null) {
            result.append("wkst", wkst);
        }

        List<DayEnum> byweekday = source.byweekday();
        if (byweekday != null)
            result.append("byweekday", byweekday);

        List<Integer> bymonth = source.bymonth();
        if (bymonth != null)
            result.append("bymonth", bymonth);

        List<Integer> byhour = source.byhour();
        if (byhour != null)
            result.append("byhour", byhour);

        List<Integer> byminute = source.byminute();
        if (byminute != null)
            result.append("byminute", byminute);

        List<Integer> bysetpos = source.bysetpos();
        if (bysetpos != null)
            result.append("bysetpos", bysetpos);

        List<Integer> bymonthday = source.bymonthday();
        if (bymonthday != null)
            result.append("bymonthday", bymonthday);

        String tzid = source.tzid();
        if (tzid != null) {
            result.append("tzid", tzid);
        }

        Integer durationInMinutes = source.durationInMinutes();
        if (durationInMinutes != null) {
            result.append("durationInMinutes", durationInMinutes);
        }

        return result;
    }
}
