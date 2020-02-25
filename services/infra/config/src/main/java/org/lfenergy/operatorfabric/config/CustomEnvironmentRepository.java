/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.config;

import org.springframework.cloud.config.environment.Environment;
import org.springframework.cloud.config.environment.PropertySource;
import org.springframework.cloud.config.server.environment.EnvironmentRepository;
import org.springframework.core.Ordered;

import java.util.HashMap;

public class CustomEnvironmentRepository implements EnvironmentRepository, Ordered {

    @Override
    public Environment findOne(String application, String profile, String label) {

        Environment result = new Environment(application, profile);
        HashMap<String,Object> props = new HashMap<>();
        Package aPackage = this.getClass().getPackage();
        props.put("operatorfabric.settings.about.operatorfabric.name", "OperatorFabric");
        props.put("operatorfabric.settings.about.operatorfabric.version", aPackage.getSpecificationVersion());
        props.put("operatorfabric.settings.about.operatorfabric.rank", 0);
        result.add(new PropertySource("application-dev", props));
        return result;
    }

    @Override
    public int getOrder(){
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
