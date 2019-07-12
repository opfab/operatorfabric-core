package org.lfenergy.operatorfabric.actions.services;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.model.Action;
import org.lfenergy.operatorfabric.actions.model.ActionStatus;
import org.lfenergy.operatorfabric.actions.model.ActionStatusData;
import org.lfenergy.operatorfabric.actions.services.feign.*;
import org.lfenergy.operatorfabric.cards.model.Card;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.utilities.ArrayUtils;
import org.lfenergy.operatorfabric.utilities.IntrospectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ActionService {

    private static Pattern TOKEN_PATTERN = Pattern.compile("\\{(.+?)\\}");

    private final CardConsultationServiceProxy cardService;
    private final ThirdsServiceProxy thirdsService;

    @Autowired
    public ActionService(CardConsultationServiceProxy cardService, ThirdsServiceProxy thirdsService) {
        this.cardService = cardService;
        this.thirdsService = thirdsService;
    }


    public ActionStatus lookUpActionStatus(String cardId, String actionKey) {
        try {
            Card card = this.cardService.fetchCard(cardId);
            if (card != null) {
                Action action = this.thirdsService.fetchAction(card.getPublisher(), card.getProcess(), card.getState(), actionKey);
                if (action != null && (action.getUpdateState() || action.getUpdateStateBeforeAction())) {
                    return ActionStatusData.fromAction(action);
                }
            }
            return null;
        } catch (FeignException fe) {
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                    .message("Error accessing remote service, no fallback behavior").build(), fe);
        }
    }

    public ActionStatus submitAction(String cardId, String actionKey, String jwt) {
        try {
            Card card = this.cardService.fetchCard(cardId);
            if (card != null) {
                Action action = this.thirdsService.fetchAction(card.getPublisher(), card.getProcess(), card.getState(), actionKey);
                if (action != null && (action.getUpdateState() || action.getUpdateStateBeforeAction())) {
                    
                    return sendAction(action,card,jwt);
                }
            }
            return null;
        } catch (FeignException fe) {
            throw new ApiErrorException(ApiError.builder().status(HttpStatus.BAD_GATEWAY)
                    .message("Error accessing remote service, no fallback behavior").build(), fe);
        }
    }

    private ActionStatus sendAction(Action action, Card card, String jwt) {
        Matcher urlMatcher = TOKEN_PATTERN.matcher(action.getUrl());
        StringBuffer sb = new StringBuffer((action.getUrl().length()));
        while(urlMatcher.find()){
            urlMatcher.appendReplacement(sb,Matcher.quoteReplacement(extractToken(card, urlMatcher.group(1), jwt)));
        }
        return null;
    }

    String extractToken(Card card,String token, String jwt) {
        
        String tokenStart = token.split("\\.")[0];

        switch(tokenStart){
            case "process":
                return card.getProcess();
            case "processInstance":
                return card.getProcessId();
            case "state":
                return card.getState();
            case "jwt":
                return jwt;
            case "data":
                return extractStringCardData(card,token);
            default:
                return null;
        }
    }

    String extractStringCardData(Card card, String token) {
        Object current = card.getData();
        String[] pathElements = ArrayUtils.copyOfRange(token.split("\\."),1);
        Object extracted = IntrospectionUtils.extractPath(current, String.join(".", pathElements));
        return extracted == null ? "null":extracted.toString();
    }

}
