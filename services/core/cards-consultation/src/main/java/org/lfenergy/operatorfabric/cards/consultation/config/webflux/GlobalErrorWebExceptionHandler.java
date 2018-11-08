package org.lfenergy.operatorfabric.cards.consultation.config.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.boot.autoconfigure.web.ResourceProperties;
import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * <p>Configure error handling for routes which matche predicate "all"</p>
 * <p>Add logs and forward error data in http response json body unless underlying exception is
 * {@link ApiErrorException}. In this case froward its associated
 * {@link org.lfenergy.operatorfabric.springtools.error.model.ApiError} object</p>
 *
 * @author David Binder
 */
@Component
@Order(-2)
@Slf4j
public class GlobalErrorWebExceptionHandler extends AbstractErrorWebExceptionHandler {

    public GlobalErrorWebExceptionHandler(GlobalErrorAttributes g, ApplicationContext applicationContext,
                                          ServerCodecConfigurer serverCodecConfigurer) {
        super(g, new ResourceProperties(), applicationContext);
        super.setMessageWriters(serverCodecConfigurer.getWriters());
        super.setMessageReaders(serverCodecConfigurer.getReaders());
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(final ErrorAttributes errorAttributes) {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse);
    }

    private Mono<ServerResponse> renderErrorResponse(final ServerRequest request) {

        final Map<String, Object> errorPropertiesMap = getErrorAttributes(request, true);
        String trace = (String) errorPropertiesMap.get("trace");
        log.warn("Error during http request processing. Activate Debug for more details");
        log.debug(trace);
        errorPropertiesMap.remove("trace");
        ServerResponse.BodyBuilder bodyBuilder = ServerResponse.status((Integer) errorPropertiesMap.get("status"))
                .contentType(MediaType.APPLICATION_JSON_UTF8);
        Throwable error = (Throwable) errorPropertiesMap.get("exception");
        if(error instanceof ApiErrorException){
            return bodyBuilder
                    .body(BodyInserters.fromObject(((ApiErrorException)error).getError()));
        }
        return bodyBuilder
           .body(BodyInserters.fromObject(errorPropertiesMap));
    }

}

