/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.thirds.config;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Profile;

/**
 * Discovery (Registry) configuration, simply enables it, deactivated if standalone spring profile is active
 *
 * @author David Binder
 */
@Profile("!standalone")
@EnableDiscoveryClient
public class DiscoveryConfig {
}
