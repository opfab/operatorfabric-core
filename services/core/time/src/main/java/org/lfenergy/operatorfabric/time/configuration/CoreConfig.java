
package org.lfenergy.operatorfabric.time.configuration;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.utilities.VirtualTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Business configuration for time module
 */
@Slf4j
@Configuration
public class CoreConfig {

    /**
     * Instantiate the virtual time singleton
     * @return virtual time singleton
     */
    @Bean
    public VirtualTime virtualTime(){
        return VirtualTime.getInstance();
    }
}
