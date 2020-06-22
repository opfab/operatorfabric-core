/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.users.configuration.mongo;

import org.bson.Document;
import org.lfenergy.operatorfabric.users.model.RightsEnum;
import org.lfenergy.operatorfabric.users.model.StateRightData;
import org.springframework.core.convert.converter.Converter;
/**
 *
 * <p>Spring converter to register {@link StateRightData} in mongoDB</p>
 * <p>Converts {@link StateRightData} to {@link Document} </p>
 * <p>Needed after upgrade to spring-boot 2.2.4.RELEASE</p>
 */
public class StateRightWriteConverter implements Converter<StateRightData, Document> {

    @Override
    public Document convert(StateRightData source) {
        Document result = new Document();

        String state = source.getState();
        result.append("state", state);

        RightsEnum right = source.getRight();
        result.append("right", right.toString());

        return result;
    }
}
