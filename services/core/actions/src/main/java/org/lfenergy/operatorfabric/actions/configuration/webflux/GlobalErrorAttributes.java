
package org.lfenergy.operatorfabric.actions.configuration.webflux;

import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.util.Map;

/**
 * <p>Implementation of {@link ErrorAttributes}</p>
 * <p>In addition to the attribute exposed bu {@link DefaultErrorAttributes}, sets status and message according
 * to {@link org.lfenergy.operatorfabric.springtools.error.model.ApiError} if underlying exception is instance of
 * {@link ApiErrorException}
 * </p>
 * @author David Binder
 */
@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

    public GlobalErrorAttributes() {
        super(true);
    }

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, boolean includeStackTrace) {
        Map<String, Object> map = super.getErrorAttributes(request, includeStackTrace);
        Throwable originThrowable = getError(request);
        map.put("origin",originThrowable);
        if(originThrowable instanceof ApiErrorException) {
            map.put("status", ((ApiErrorException)originThrowable).getError().getStatus().value());
            map.put("message", ((ApiErrorException)originThrowable).getError().getMessage());
        }
        return map;
    }

}
