/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ProcessStatesData implements ProcessStates {
    private ResponseData responseData;
    private AcknowledgmentAllowedEnum acknowledgmentAllowed;
    private ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen;

    @Builder.Default
    private Boolean cancelAcknowledgmentAllowed = true;
    @Builder.Default
    private Boolean  closeCardWhenUserAcknowledges = true;
    @Builder.Default
    private Boolean editCardEnabledOnUserInterface = true;
    @Builder.Default
    private Boolean deleteCardEnabledOnUserInterface = true;

    private String color;
    private String name;
    private String description;
    private Boolean showDetailCardHeader;
    private UserCard userCard;
    private String templateName;
    @Singular
    private List<String> styles;
    private TypeOfStateEnum type;
    private Boolean isOnlyAChildState;
    private String validateAnswerButtonLabel;
    private String modifyAnswerButtonLabel;
    private Boolean automaticPinWhenAcknowledged;

    @Override
    public Response getResponse() {
        return responseData;
    }

    @Override
    public void setResponse(Response responseData) {
        this.responseData = (ResponseData) responseData;
    }

    @Override
    public AcknowledgmentAllowedEnum getAcknowledgmentAllowed() { return this.acknowledgmentAllowed; }

    @Override
    public void setAcknowledgmentAllowed(AcknowledgmentAllowedEnum acknowledgmentAllowed) { this.acknowledgmentAllowed = acknowledgmentAllowed; }

    @Override
    public ConsideredAcknowledgedForUserWhenEnum getConsideredAcknowledgedForUserWhen() { return this.consideredAcknowledgedForUserWhen; }

    @Override
    public void setConsideredAcknowledgedForUserWhen(ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen) {
        this.consideredAcknowledgedForUserWhen = consideredAcknowledgedForUserWhen;
    }

    @Override
    public TypeOfStateEnum getType() { return this.type; }

    @Override
    public void setType(TypeOfStateEnum type) { this.type = type; }

    @Override
    public Boolean getAutomaticPinWhenAcknowledged() {
        return this.automaticPinWhenAcknowledged;
    }

    @Override
    public void setAutomaticPinWhenAcknowledged(Boolean automaticPinWhenAcknowledged) {
        this.automaticPinWhenAcknowledged = automaticPinWhenAcknowledged;
    }
    @Override
    public Boolean getCancelAcknowledgmentAllowed() {
        return cancelAcknowledgmentAllowed;
    }
    @Override
    public void setCancelAcknowledgmentAllowed(Boolean cancelAcknowledgmentAllowed) {
        this.cancelAcknowledgmentAllowed = cancelAcknowledgmentAllowed;
    }
    @Override
    public Boolean getCloseCardWhenUserAcknowledges() { return closeCardWhenUserAcknowledges;}

    @Override
    public void setCloseCardWhenUserAcknowledges(Boolean closeCardWhenUserAcknowledges) {
        this.closeCardWhenUserAcknowledges = closeCardWhenUserAcknowledges;
    }

    @Override
    public Boolean getEditCardEnabledOnUserInterface() {
        return editCardEnabledOnUserInterface;
    }

    @Override
    public void setEditCardEnabledOnUserInterface(Boolean editCardEnabledOnUserInterface) {
        this.editCardEnabledOnUserInterface = editCardEnabledOnUserInterface;
    }

    @Override
    public Boolean getDeleteCardEnabledOnUserInterface() {
        return deleteCardEnabledOnUserInterface;
    }

    @Override
    public void setDeleteCardEnabledOnUserInterface(Boolean deleteCardEnabledOnUserInterface) {
        this.deleteCardEnabledOnUserInterface = deleteCardEnabledOnUserInterface;
    }
}
