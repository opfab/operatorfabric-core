
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
