/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.mongo;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * <p>Enables Mongo generic configuration for Operator Fabric (see {@link MongoConfiguration})</p>
 *
 * @author David Binder
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({MongoConfiguration.class, OperatorFabricMongoProperties.class})
@Documented
public @interface EnableOperatorFabricMongo {

}
