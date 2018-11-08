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
