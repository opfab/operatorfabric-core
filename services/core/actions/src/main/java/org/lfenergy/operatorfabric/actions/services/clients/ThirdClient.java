package org.lfenergy.operatorfabric.actions.services.clients;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class ThirdClient {

    public static final String THIRD_401_MESSAGE = "OperatorFabric third service returned 401(Unauthorized), " +
            "authentication may have expired or remote service is incorrectly configured";
    public static final String THIRD_403_MESSAGE = "OperatorFabric third service returned 403(Unauthorized), " +
            "user not allowed to access resource";
    public static final String THIRD_ERROR_MESSAGE = "Error accessing OperatorFabric third service, no fallback behavior";
    public static final String NO_THIRD_ACTION_MESSAGE = "No Action found";
    public final static String ACTION_FETCH_ERROR = "Unable to fetch Action";

    @Value("${operatorfabric.services.base-url.thirds}")
    String thirdBaseUrl;
    private final WebClient client;

    @Autowired
    ThirdClient(ObjectMapper objectMapper) {
        ExchangeStrategies strategies = ExchangeStrategies
                .builder()
                .codecs(clientDefaultCodecsConfigurer -> {
                    clientDefaultCodecsConfigurer.defaultCodecs().jackson2JsonEncoder(new Jackson2JsonEncoder(objectMapper, MediaType.APPLICATION_JSON));
                    clientDefaultCodecsConfigurer.defaultCodecs().jackson2JsonDecoder(new Jackson2JsonDecoder(objectMapper, MediaType.APPLICATION_JSON));

                }).build();
        this.client = WebClient.builder().exchangeStrategies(strategies).baseUrl(this.thirdBaseUrl).build();
    }

    public Mono<ActionData> fetchMonoOfAction(@PathVariable("thirdName") String thirdName,
                                              @PathVariable("process") String process,
                                              @PathVariable("state") String state,
                                              @PathVariable("actionKey") String actionKey,
                                              @RequestHeader("Authorization") String auth) {
        return client.get()
                .uri(this.thirdBaseUrl + "/thirds/{thirdName}/{process}/{state}/actions/{actionKey}"
                        , thirdName, process, state, actionKey)
                .header("Authorization", auth)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, response -> {
                    switch (response.rawStatusCode()) {
                        case 404:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                    .message(NO_THIRD_ACTION_MESSAGE).build()));
                        case 401:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(THIRD_401_MESSAGE).build()));
                        case 403:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.UNAUTHORIZED)
                                    .message(THIRD_403_MESSAGE).build()));
                        default:
                            return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                                    .message(THIRD_ERROR_MESSAGE).build()));
                    }
                })
                .bodyToMono(ActionData.class)
                .onErrorResume(m ->
                        Mono.error(new ApiErrorException(ApiError
                                .builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .message(ACTION_FETCH_ERROR)
                                .build()))
                );
    }

}
