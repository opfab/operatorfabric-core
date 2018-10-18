/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.time;

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * <p></p>
 * Created on 29/06/18
 *
 * @author davibind
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(TimeAmqpClientConfig.class)
@Documented
public @interface EnableTimeClient {

}
