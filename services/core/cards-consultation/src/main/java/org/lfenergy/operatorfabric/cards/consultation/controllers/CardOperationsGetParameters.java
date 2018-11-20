package org.lfenergy.operatorfabric.cards.consultation.controllers;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;
import org.lfenergy.operatorfabric.users.model.User;

@Value
@Builder
@AllArgsConstructor
public class CardOperationsGetParameters {
    private boolean test;
    private boolean notification;
    private String clientId;
    private Long rangeStart;
    private Long rangeEnd;
    private User user;

}
