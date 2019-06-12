/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.time;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * <p>On configuration or application class enables configuration of time AMQP exchange and
 * {@link TimeReceiver}, (see {@link TimeAmqpClientConfig})</p>
 *
 * @author David Binder
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(TimeAmqpClientConfig.class)
@Documented
public @interface EnableTimeClient {

}
