/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.aop.process;

import org.opfab.aop.process.mongo.models.UserActionTraceData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

public class MongoActionTraceAspect extends AbstractActionAspect<UserActionTraceData> {

    @Autowired
    protected MongoTemplate template;

    @Override
    void trace(UserActionTraceData trace) {
        template.save(trace);
    }


}
