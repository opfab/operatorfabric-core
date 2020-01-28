
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.cloud.bus.jackson.RemoteApplicationEventScan;
import org.springframework.context.annotation.Configuration;

/**
 * <p>This configuration class registers all custom events from current package with Spring Cloud Bus.</p>
 * Created on 12/02/19
 *
 * @author Alexandra Guironnet
 */
@Configuration
@RemoteApplicationEventScan
public class BusConfiguration {

}
