package org.lfenergy.operatorfabric.actions.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionStatus;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.services.feign.CardConsultationServiceProxy;
import org.lfenergy.operatorfabric.actions.services.feign.ThirdsServiceProxy;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.utilities.ArrayUtils;
import org.lfenergy.operatorfabric.utilities.IntrospectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ActionService {

    private static Pattern TOKEN_PATTERN = Pattern.compile("\\{(.+?)\\}");

    private final CardConsultationServiceProxy cardService;
    private final ThirdsServiceProxy thirdsService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ActionService(CardConsultationServiceProxy cardService, ThirdsServiceProxy thirdsService, ObjectMapper objectMapper) {
        this.cardService = cardService;
        this.thirdsService = thirdsService;
        this.objectMapper = objectMapper;
    }


    public ActionStatus lookUpActionStatus(String publisher, String process, String state, String actionKey, String jwt) {
        try {
            Card card = this.cardService.fetchCard(publisher + "_" + process, "Bearer " + jwt);
            if (card != null) {
                Action action = this.thirdsService.fetchAction(card.getPublisher(), card.getProcess(), card.getState(), actionKey, "Bearer " + jwt);
                if (action != null && (action.getUpdateState() != null && action.getUpdateState()
                        || action.getUpdateStateBeforeAction() != null && action.getUpdateStateBeforeAction())) {
                    return updateAction(action, card, jwt);
                }
                return ActionStatusData.fromAction(action);
            }
            return null;
        } catch (FeignException fe) {
            switch (fe.status()) {
                case 404:
                    throw new ApiErrorException(ApiError.builder().status(HttpStatus.NOT_FOUND)
                            .message("No such card or action").build(), fe);
                default:
                    throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                            .message("Error accessing remote service, no fallback behavior").build(), fe);
            }

        }
    }

    public ActionStatus submitAction(String publisher, String process, String state, String actionKey, String jwt, String body) {
        try {
            Card card = this.cardService.fetchCard(publisher + "_" + process, "Bearer " + jwt);
            if (card != null) {
                Action action = this.thirdsService.fetchAction(card.getPublisher(), card.getProcess(), card.getState(), actionKey, "Bearer " + jwt);
                if (action != null && (action.getUpdateState() || action.getUpdateStateBeforeAction())) {

                    return sendAction(action, card, jwt, body);
                }
            }
            return null;
        } catch (FeignException fe) {
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                    .message("Error accessing remote service, no fallback behavior").build(), fe);
        }
    }

    private ActionStatus sendAction(Action action, Card card, String jwt, String body) {
        String url = replaceTokens(action, card, jwt);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> result = restTemplate.postForEntity(url, body, String.class);

        return extractStatus(result);
    }

    private ActionStatus extractStatus(ResponseEntity<String> entity) {
        switch (entity.getStatusCodeValue()) {
            case 200:
                try {
                    return this.objectMapper.readValue(entity.getBody(), ActionStatusData.class);
                } catch (IOException e) {
                    log.warn("Exception delinearizing data from remote action url", e);
                }
            default:
                return null;
        }
    }

    private ActionStatus updateAction(Action action, Card card, String jwt) {
        String url = replaceTokens(action, card, jwt);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> result = restTemplate.getForEntity(url, String.class);

        return extractStatus(result);
    }

    private String replaceTokens(Action action, Card card, String jwt) {
        Matcher urlMatcher = TOKEN_PATTERN.matcher(action.getUrl());
        StringBuffer sb = new StringBuffer((action.getUrl().length()));
        while (urlMatcher.find()) {
            urlMatcher.appendReplacement(sb, Matcher.quoteReplacement(extractToken(card, urlMatcher.group(1), jwt)));
        }
        return sb.toString();
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
