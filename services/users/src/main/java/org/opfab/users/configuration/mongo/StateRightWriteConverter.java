/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.configuration.mongo;

import org.bson.Document;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRight;
import org.springframework.core.convert.converter.Converter;
/**
 *
 * <p>Spring converter to register {@link StateRight} in mongoDB</p>
 * <p>Converts {@link StateRight} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class StateRightWriteConverter implements Converter<StateRight, Document> {

    @Override
    public Document convert(StateRight source) {
        Document result = new Document();

        String state = source.getState();
        result.append("state", state);

        RightsEnum right = source.getRight();
        result.append("right", right.toString());

        Boolean filteringNotificationAllowed = source.getFilteringNotificationAllowed();
        result.append("filteringNotificationAllowed", filteringNotificationAllowed);

        return result;
    }
}
