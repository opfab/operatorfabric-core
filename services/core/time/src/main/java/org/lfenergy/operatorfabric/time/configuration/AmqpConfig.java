
package org.lfenergy.operatorfabric.time.configuration;

import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AMQP exchange configuration
 *
 * @author David Binder
 */
@Configuration
public class AmqpConfig {

    static final String EXCHANGE_NAME = "timeExchange";

    /**
     * Instantiate the exchange used to transfer time information
     * @return time fanout exchange
     */
    @Bean
    public FanoutExchange timeExchange(){
        return (FanoutExchange) ExchangeBuilder.fanoutExchange(EXCHANGE_NAME).build();
    }
}
