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

public  class HoursAndMinutesWriterConverter {

    private HoursAndMinutesWriterConverter() {
        throw new IllegalStateException("Utility class");
      }


    public static Document convert(HoursAndMinutes source) {
        Document result = new Document();

        Integer hours = source.getHours();
        Integer minutes = source.getMinutes();
        result.append("hours", hours);
        result.append("minutes",minutes);

        return result;

    }

}
