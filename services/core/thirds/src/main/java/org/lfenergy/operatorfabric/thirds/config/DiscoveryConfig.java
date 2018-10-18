/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.thirds.config;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Profile;

/**
 * <p></p>
 * Created on 07/09/18
 *
 * @author davibind
 */
@Profile("!standalone")
@EnableDiscoveryClient
public class DiscoveryConfig {
}
