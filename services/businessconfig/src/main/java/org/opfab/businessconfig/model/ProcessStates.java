/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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

import org.springframework.validation.annotation.Validated;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public class ProcessStates {

    private AcknowledgmentAllowedEnum acknowledgmentAllowed;
    private ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen;
    private ShowAcknowledgmentFooterEnum showAcknowledgmentFooter;

    @Builder.Default
    private Boolean cancelAcknowledgmentAllowed = true;
    @Builder.Default
    private Boolean closeCardWhenUserAcknowledges = true;
    @Builder.Default
    private Boolean editCardEnabledOnUserInterface = true;
    @Builder.Default
    private Boolean copyCardEnabledOnUserInterface = true;
    @Builder.Default
    private Boolean deleteCardEnabledOnUserInterface = true;

    private String color;
    private String name;
    private String description;
    private Boolean showDetailCardHeader;
    private UserCard userCard;
    private Response response;
    private String templateName;
    private String emailBodyTemplate;
    @Singular
    private List<String> styles;
    private TypeOfStateEnum type;
    private Boolean isOnlyAChildState;
    private String validateAnswerButtonLabel;
    private String modifyAnswerButtonLabel;
    private Boolean automaticPinWhenAcknowledged;

    public AcknowledgmentAllowedEnum getAcknowledgmentAllowed() {
        return this.acknowledgmentAllowed;
    }

    public void setAcknowledgmentAllowed(AcknowledgmentAllowedEnum acknowledgmentAllowed) {
        this.acknowledgmentAllowed = acknowledgmentAllowed;
    }

    public ConsideredAcknowledgedForUserWhenEnum getConsideredAcknowledgedForUserWhen() {
        return this.consideredAcknowledgedForUserWhen;
    }

    public void setConsideredAcknowledgedForUserWhen(
            ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen) {
        this.consideredAcknowledgedForUserWhen = consideredAcknowledgedForUserWhen;
    }

    public ShowAcknowledgmentFooterEnum getShowAcknowledgmentFooter() {
        return this.showAcknowledgmentFooter;
    }

    public void setShowAcknowledgmentFooter(ShowAcknowledgmentFooterEnum showAcknowledgmentFooter) {
        this.showAcknowledgmentFooter = showAcknowledgmentFooter;
    }

    public TypeOfStateEnum getType() {
        return this.type;
    }

    public void setType(TypeOfStateEnum type) {
        this.type = type;
    }

    public Boolean getAutomaticPinWhenAcknowledged() {
        return this.automaticPinWhenAcknowledged;
    }

    public void setAutomaticPinWhenAcknowledged(Boolean automaticPinWhenAcknowledged) {
        this.automaticPinWhenAcknowledged = automaticPinWhenAcknowledged;
    }

    public Boolean getCancelAcknowledgmentAllowed() {
        return cancelAcknowledgmentAllowed;
    }

    public void setCancelAcknowledgmentAllowed(Boolean cancelAcknowledgmentAllowed) {
        this.cancelAcknowledgmentAllowed = cancelAcknowledgmentAllowed;
    }

    public Boolean getCloseCardWhenUserAcknowledges() {
        return closeCardWhenUserAcknowledges;
    }

    public void setCloseCardWhenUserAcknowledges(Boolean closeCardWhenUserAcknowledges) {
        this.closeCardWhenUserAcknowledges = closeCardWhenUserAcknowledges;
    }

    public Boolean getEditCardEnabledOnUserInterface() {
        return editCardEnabledOnUserInterface;
    }

    public void setEditCardEnabledOnUserInterface(Boolean editCardEnabledOnUserInterface) {
        this.editCardEnabledOnUserInterface = editCardEnabledOnUserInterface;
    }

    public Boolean getCopyCardEnabledOnUserInterface() {
        return copyCardEnabledOnUserInterface;
    }

    public void setCopyCardEnabledOnUserInterface(Boolean copyCardEnabledOnUserInterface) {
        this.copyCardEnabledOnUserInterface = copyCardEnabledOnUserInterface;
    }

    public Boolean getDeleteCardEnabledOnUserInterface() {
        return deleteCardEnabledOnUserInterface;
    }

    public void setDeleteCardEnabledOnUserInterface(Boolean deleteCardEnabledOnUserInterface) {
        this.deleteCardEnabledOnUserInterface = deleteCardEnabledOnUserInterface;
    }
}
