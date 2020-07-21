package org.lfenergy.operatorfabric.aop.annotations;

import org.lfenergy.operatorfabric.aop.process.UserAcknowledgmentActionTraceAspect;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * Enable OperatorFabric AOP Tracing configuration
 *
 *
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({UserAcknowledgmentActionTraceAspect.class})
@Documented
public @interface EnableAopTraceProcessing {
}
