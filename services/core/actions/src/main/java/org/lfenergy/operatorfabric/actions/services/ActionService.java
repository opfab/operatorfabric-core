/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionData;
import org.lfenergy.operatorfabric.actions.model.ActionStatus;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.services.clients.CardConsultationClient;
import org.lfenergy.operatorfabric.actions.services.clients.ThirdClient;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.utilities.ArrayUtils;
import org.lfenergy.operatorfabric.utilities.IntrospectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ActionService {

    public static final String BEARER_PREFIX = "Bearer ";
    static final String REMOTE_404_MESSAGE = "Specified action was not handle by third party endpoint (not found)";
    static final String UNEXPECTED_REMOTE_3RD_MESSAGE = "Unexpected behaviour of third party handler endpoint";
    static final String DELINEARIZING_ERROR_MESSAGE = "Exception delinearizing data from remote action url";
    public static final String EMPTY_RESULT_MESSAGE = "Card or action was empty";
    public static final String NO_SUCH_CARD_OR_ACTION_MESSAGE = "No such card or action";
    public static final String FEIGN_401_MESSAGE = "Remote service returned 401(Unauthorized), authentication may have expired or remote service is incorrectly configured";
    public static final String FEIGN_403_MESSAGE = "Remote service returned 403(Unauthorized), user not allowed to acces resource";
    public static final String BAD_STATE_MESSAGE = "Submitted state does not match current card state";
    private static Pattern TOKEN_PATTERN = Pattern.compile("\\{(.+?)\\}");

    private final CardConsultationClient cardService;
    private final ThirdClient thirdsService;
    private final ObjectMapper objectMapper;
    private RestTemplate restTemplate;

    @Autowired
    public ActionService(CardConsultationClient cardConsultationClient
            , ThirdClient thirdClient
            , ObjectMapper objectMapper
            , RestTemplate restTemplate) {
        this.cardService = cardConsultationClient;
        this.thirdsService = thirdClient;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }


    public Mono<ActionStatus> lookUpActionStatus(String publisher
            , String process
            , String state
            , String actionKey
            , String jwt) {
        return this.cardService.fetchMonoCard(publisher + "_" + process, BEARER_PREFIX + jwt)
                .flatMap(card -> {
                    if (card == null) {
                        return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                                .message(EMPTY_RESULT_MESSAGE).build()));
                    }
                    return fetchAction(state, actionKey, jwt, card)
                            .map(action -> (ActionStatus) computeActionStatus(jwt, card, action));
                })
                ;
    }

    private ActionStatus computeActionStatus(String jwt, Card card, Action action) {
        if (action == null) throw new ApiErrorException(ApiError.builder()
                .status(HttpStatus.NOT_FOUND)
                .message(EMPTY_RESULT_MESSAGE)
                .build());
        if (action.getUpdateStateBeforeAction() != null && action.getUpdateStateBeforeAction()) {
            return updateAction(action, card, jwt);
        }
        return ActionStatusData.fromAction(action);
    }

    private Mono<ActionData> fetchAction(String state, String actionKey, String jwt, Card card) {
        if (!state.equals(card.getState())) {
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_REQUEST)
                    .message(BAD_STATE_MESSAGE).build());
        }
        return this.thirdsService.fetchMonoOfAction(
                card.getPublisher()
                , card.getProcess()
                , card.getState()
                , actionKey
                , BEARER_PREFIX + jwt);
    }


    public Mono<ActionStatus> submitAction(String publisher, String process, String state, String actionKey, String jwt, String body) {
        return this.cardService.fetchMonoCard(publisher + "_" + process, BEARER_PREFIX + jwt).flatMap(card -> {
            if (card == null) {
                return Mono.error(new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                        .message(EMPTY_RESULT_MESSAGE).build()));

            }
            return fetchAction(state, actionKey, jwt, card).map(action -> {
                if (action == null) {
                    throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                            .message(EMPTY_RESULT_MESSAGE).build());
                }
                return sendAction(action, card, jwt, body);
            });
        });
    }

    ActionStatus sendAction(Action action, Card card, String jwt, String body) {
        try {
            String url = replaceTokens(action, card, jwt);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwt);
            // need to remove accepted charSet header otherwise 413 Full Header arises
            List<Charset> acceptCharset = Collections.singletonList(StandardCharsets.UTF_8);
            headers.setAcceptCharset(acceptCharset);
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> result = restTemplate.postForEntity(
                    url
                    , request
                    , String.class);
            if (result.hasBody() && result.getBody().equals("{}")) {
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.BAD_GATEWAY)
                        .message(EMPTY_RESULT_MESSAGE)
                        .build());
            }
            return extractStatus(result);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(REMOTE_404_MESSAGE)
                    .build());
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(UNEXPECTED_REMOTE_3RD_MESSAGE)
                    .build());
        } catch (IllegalArgumentException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(EMPTY_RESULT_MESSAGE)
                    .build());
        }
    }

    private ActionStatus extractStatus(ResponseEntity<String> entity) {
        switch (entity.getStatusCodeValue()) {
            case 200:
                try {
                    return this.objectMapper.readValue(
                            entity.getBody(),
                            ActionStatusData.class);
                } catch (IOException e) {
                    log.warn(DELINEARIZING_ERROR_MESSAGE, e);
                    return null;
                }
            case 204:
                return null;
            default:
                throw new ApiErrorException(ApiError.builder()
                        .status(HttpStatus.BAD_GATEWAY)
                        .message(UNEXPECTED_REMOTE_3RD_MESSAGE)
                        .build());
        }
    }

    ActionStatus updateAction(Action action, Card card, String jwt) {
        String url = replaceTokens(action, card, jwt);
        try {
            ResponseEntity<String> result = restTemplate.getForEntity(
                    url, String.class);
            return extractStatus(result);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(REMOTE_404_MESSAGE)
                    .build());
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new ApiErrorException(ApiError.builder()
                    .status(HttpStatus.BAD_GATEWAY)
                    .message(UNEXPECTED_REMOTE_3RD_MESSAGE)
                    .build());
        }

    }

    String replaceTokens(Action action, Card card, String jwt) {

        String actionUrl = action.getUrl();

        Matcher urlMatcher = TOKEN_PATTERN.matcher(actionUrl);

        StringBuffer sb = new StringBuffer((actionUrl.length()));
        while (urlMatcher.find()) {
            urlMatcher.appendReplacement(sb, Matcher.quoteReplacement(extractToken(card, urlMatcher.group(1), jwt)));
        }
        if (sb.length() > 0) return sb.toString();
        return actionUrl;
    }

    String extractToken(Card card, String token, String jwt) {

        String tokenStart = token.split("\\.")[0];

        switch (tokenStart) {
            case "process":
                return card.getProcess();
            case "processInstance":
                return card.getProcessId();
            case "state":
                return card.getState();
            case "jwt":
                return jwt;
            case "data":
                return extractStringCardData(card, token);
            default:
                return null;
        }
    }

    String extractStringCardData(Card card, String token) {
        Object current = card.getData();
        String[] pathElements = ArrayUtils.copyOfRange(token.split("\\."), 1);
        Object extracted = IntrospectionUtils.extractPath(current, String.join(".", pathElements));
        return extracted == null ? "null" : extracted.toString();
    }

}
