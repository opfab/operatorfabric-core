/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.springframework.cloud.bus.jackson.RemoteApplicationEventScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@RemoteApplicationEventScan(basePackages = "org.lfenergy.operatorfabric.springtools.config.oauth") //TODO See if needed since event is in the same package
public class BusConfiguration {
    // According to documentation, this should register event with the deserializer
    // Source : https://cloud.spring.io/spring-cloud-bus/single/spring-cloud-bus.html#_registering_events_in_custom_packages
}
