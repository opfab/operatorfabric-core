package org.lfenergy.operatorfabric.time.config;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.utilities.SimulatedTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Business configuration for timemodule
 */
@Slf4j
@Configuration
public class CoreConfig {

    /**
     * Instantiate the simulated time singleton
     * @return
     */
    @Bean
    public SimulatedTime simulatedTime(){
        return SimulatedTime.getInstance();
    }
}
