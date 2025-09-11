/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.common.businessconfig;

import java.util.Objects;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProcessStates {
    private Response response = null;

    private AcknowledgmentAllowedEnum acknowledgmentAllowed = null;

    private ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen = null;

    private Boolean cancelAcknowledgmentAllowed = false;

    private ShowAcknowledgmentFooterEnum showAcknowledgmentFooter = null;

    private Boolean closeCardWhenUserAcknowledges = false;

    private Boolean editCardEnabledOnUserInterface = false;

    private Boolean copyCardEnabledOnUserInterface = false;

    private Boolean deleteCardEnabledOnUserInterface = false;

    private String name = null;

    private String description = null;

    private Boolean showDetailCardHeader = true;

    private String color = null;

    private UserCard userCard = null;

    private String templateName = null;

    private String emailBodyTemplate = null;

    private String emailAttachmentTemplate = null;

    private String emailAttachmentFileName = null;

    private List<String> styles = null;

    private TypeOfStateEnum type = null;

    private Boolean isOnlyAChildState = false;

    private String validateAnswerButtonLabel = null;

    private String modifyAnswerButtonLabel = null;

    private Boolean automaticPinWhenAcknowledged = false;

    public ProcessStates response(Response response) {
        this.response = response;
        return this;
    }

    public Response getResponse() {
        return response;
    }

    public void setResponse(Response response) {
        this.response = response;
    }

    public ProcessStates acknowledgmentAllowed(
            AcknowledgmentAllowedEnum acknowledgmentAllowed) {
        this.acknowledgmentAllowed = acknowledgmentAllowed;
        return this;
    }

    public AcknowledgmentAllowedEnum getAcknowledgmentAllowed() {
        return acknowledgmentAllowed;
    }

    public void setAcknowledgmentAllowed(
            AcknowledgmentAllowedEnum acknowledgmentAllowed) {
        this.acknowledgmentAllowed = acknowledgmentAllowed;
    }

    public ProcessStates consideredAcknowledgedForUserWhen(
            ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen) {
        this.consideredAcknowledgedForUserWhen = consideredAcknowledgedForUserWhen;
        return this;
    }

    public ConsideredAcknowledgedForUserWhenEnum getConsideredAcknowledgedForUserWhen() {
        return consideredAcknowledgedForUserWhen;
    }

    public void setConsideredAcknowledgedForUserWhen(
            ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen) {
        this.consideredAcknowledgedForUserWhen = consideredAcknowledgedForUserWhen;
    }

    public ProcessStates cancelAcknowledgmentAllowed(Boolean cancelAcknowledgmentAllowed) {
        this.cancelAcknowledgmentAllowed = cancelAcknowledgmentAllowed;
        return this;
    }

    public Boolean getCancelAcknowledgmentAllowed() {
        return cancelAcknowledgmentAllowed;
    }

    public void setCancelAcknowledgmentAllowed(Boolean cancelAcknowledgmentAllowed) {
        this.cancelAcknowledgmentAllowed = cancelAcknowledgmentAllowed;
    }

    public ProcessStates showAcknowledgmentFooter(
            ShowAcknowledgmentFooterEnum showAcknowledgmentFooter) {
        this.showAcknowledgmentFooter = showAcknowledgmentFooter;
        return this;
    }

    public ShowAcknowledgmentFooterEnum getShowAcknowledgmentFooter() {
        return showAcknowledgmentFooter;
    }

    public void setShowAcknowledgmentFooter(
            ShowAcknowledgmentFooterEnum showAcknowledgmentFooter) {
        this.showAcknowledgmentFooter = showAcknowledgmentFooter;
    }

    public ProcessStates closeCardWhenUserAcknowledges(Boolean closeCardWhenUserAcknowledges) {
        this.closeCardWhenUserAcknowledges = closeCardWhenUserAcknowledges;
        return this;
    }

    public Boolean getCloseCardWhenUserAcknowledges() {
        return closeCardWhenUserAcknowledges;
    }

    public void setCloseCardWhenUserAcknowledges(Boolean closeCardWhenUserAcknowledges) {
        this.closeCardWhenUserAcknowledges = closeCardWhenUserAcknowledges;
    }

    public ProcessStates editCardEnabledOnUserInterface(Boolean editCardEnabledOnUserInterface) {
        this.editCardEnabledOnUserInterface = editCardEnabledOnUserInterface;
        return this;
    }

    public Boolean getEditCardEnabledOnUserInterface() {
        return editCardEnabledOnUserInterface;
    }

    public void setEditCardEnabledOnUserInterface(Boolean editCardEnabledOnUserInterface) {
        this.editCardEnabledOnUserInterface = editCardEnabledOnUserInterface;
    }

    public ProcessStates copyCardEnabledOnUserInterface(Boolean copyCardEnabledOnUserInterface) {
        this.copyCardEnabledOnUserInterface = copyCardEnabledOnUserInterface;
        return this;
    }

    public Boolean getCopyCardEnabledOnUserInterface() {
        return copyCardEnabledOnUserInterface;
    }

    public void setCopyCardEnabledOnUserInterface(Boolean copyCardEnabledOnUserInterface) {
        this.copyCardEnabledOnUserInterface = copyCardEnabledOnUserInterface;
    }

    public ProcessStates deleteCardEnabledOnUserInterface(Boolean deleteCardEnabledOnUserInterface) {
        this.deleteCardEnabledOnUserInterface = deleteCardEnabledOnUserInterface;
        return this;
    }

    public Boolean getDeleteCardEnabledOnUserInterface() {
        return deleteCardEnabledOnUserInterface;
    }

    public void setDeleteCardEnabledOnUserInterface(Boolean deleteCardEnabledOnUserInterface) {
        this.deleteCardEnabledOnUserInterface = deleteCardEnabledOnUserInterface;
    }

    public ProcessStates name(String name) {
        this.name = name;
        return this;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProcessStates description(String description) {
        this.description = description;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProcessStates showDetailCardHeader(Boolean showDetailCardHeader) {
        this.showDetailCardHeader = showDetailCardHeader;
        return this;
    }

    public Boolean getShowDetailCardHeader() {
        return showDetailCardHeader;
    }

    public void setShowDetailCardHeader(Boolean showDetailCardHeader) {
        this.showDetailCardHeader = showDetailCardHeader;
    }

    public ProcessStates color(String color) {
        this.color = color;
        return this;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public ProcessStates userCard(UserCard userCard) {
        this.userCard = userCard;
        return this;
    }

    public UserCard getUserCard() {
        return userCard;
    }

    public void setUserCard(UserCard userCard) {
        this.userCard = userCard;
    }

    public ProcessStates templateName(String templateName) {
        this.templateName = templateName;
        return this;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public ProcessStates emailBodyTemplate(String emailBodyTemplate) {
        this.emailBodyTemplate = emailBodyTemplate;
        return this;
    }

    public String getEmailBodyTemplate() {
        return emailBodyTemplate;
    }

    public void setEmailBodyTemplate(String emailBodyTemplate) {
        this.emailBodyTemplate = emailBodyTemplate;
    }

    public ProcessStates emailAttachmentTemplate(String emailAttachmentTemplate) {
        this.emailAttachmentTemplate = emailAttachmentTemplate;
        return this;
    }

    public String getEmailAttachmentTemplate() {
        return emailAttachmentTemplate;
    }

    public void setEmailAttachmentTemplate(String emailAttachmentTemplate) {
        this.emailAttachmentTemplate = emailAttachmentTemplate;
    }

    public ProcessStates emailAttachmentFileName(String emailAttachmentFileName) {
        this.emailAttachmentFileName = emailAttachmentFileName;
        return this;
    }

    public String getEmailAttachmentFileName() {
        return emailAttachmentFileName;
    }

    public void setEmailAttachmentFileName(String emailAttachmentFileName) {
        this.emailAttachmentFileName = emailAttachmentFileName;
    }

    public ProcessStates styles(List<String> styles) {
        this.styles = styles;
        return this;
    }

    public ProcessStates addStylesItem(String stylesItem) {
        if (this.styles == null) {
            this.styles = new ArrayList<>();
        }
        this.styles.add(stylesItem);
        return this;
    }

    public List<String> getStyles() {
        return styles;
    }

    public void setStyles(List<String> styles) {
        this.styles = styles;
    }

    public ProcessStates type(TypeOfStateEnum type) {
        this.type = type;
        return this;
    }

    public TypeOfStateEnum getType() {
        return type;
    }

    public void setType(TypeOfStateEnum type) {
        this.type = type;
    }

    public ProcessStates isOnlyAChildState(Boolean isOnlyAChildState) {
        this.isOnlyAChildState = isOnlyAChildState;
        return this;
    }

    public Boolean getIsOnlyAChildState() {
        return isOnlyAChildState;
    }

    public void setIsOnlyAChildState(Boolean isOnlyAChildState) {
        this.isOnlyAChildState = isOnlyAChildState;
    }

    public ProcessStates validateAnswerButtonLabel(String validateAnswerButtonLabel) {
        this.validateAnswerButtonLabel = validateAnswerButtonLabel;
        return this;
    }

    public String getValidateAnswerButtonLabel() {
        return validateAnswerButtonLabel;
    }

    public void setValidateAnswerButtonLabel(String validateAnswerButtonLabel) {
        this.validateAnswerButtonLabel = validateAnswerButtonLabel;
    }

    public ProcessStates modifyAnswerButtonLabel(String modifyAnswerButtonLabel) {
        this.modifyAnswerButtonLabel = modifyAnswerButtonLabel;
        return this;
    }

    public String getModifyAnswerButtonLabel() {
        return modifyAnswerButtonLabel;
    }

    public void setModifyAnswerButtonLabel(String modifyAnswerButtonLabel) {
        this.modifyAnswerButtonLabel = modifyAnswerButtonLabel;
    }

    public ProcessStates automaticPinWhenAcknowledged(Boolean automaticPinWhenAcknowledged) {
        this.automaticPinWhenAcknowledged = automaticPinWhenAcknowledged;
        return this;
    }

    public Boolean getAutomaticPinWhenAcknowledged() {
        return automaticPinWhenAcknowledged;
    }

    public void setAutomaticPinWhenAcknowledged(Boolean automaticPinWhenAcknowledged) {
        this.automaticPinWhenAcknowledged = automaticPinWhenAcknowledged;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ProcessStates processStates = (ProcessStates) o;
        return Objects.equals(this.response, processStates.response) &&
                Objects.equals(this.acknowledgmentAllowed, processStates.acknowledgmentAllowed) &&
                Objects.equals(this.consideredAcknowledgedForUserWhen, processStates.consideredAcknowledgedForUserWhen)
                &&
                Objects.equals(this.cancelAcknowledgmentAllowed, processStates.cancelAcknowledgmentAllowed) &&
                Objects.equals(this.showAcknowledgmentFooter, processStates.showAcknowledgmentFooter) &&
                Objects.equals(this.closeCardWhenUserAcknowledges, processStates.closeCardWhenUserAcknowledges) &&
                Objects.equals(this.editCardEnabledOnUserInterface, processStates.editCardEnabledOnUserInterface) &&
                Objects.equals(this.copyCardEnabledOnUserInterface, processStates.copyCardEnabledOnUserInterface) &&
                Objects.equals(this.deleteCardEnabledOnUserInterface, processStates.deleteCardEnabledOnUserInterface) &&
                Objects.equals(this.name, processStates.name) &&
                Objects.equals(this.description, processStates.description) &&
                Objects.equals(this.showDetailCardHeader, processStates.showDetailCardHeader) &&
                Objects.equals(this.color, processStates.color) &&
                Objects.equals(this.userCard, processStates.userCard) &&
                Objects.equals(this.templateName, processStates.templateName) &&
                Objects.equals(this.emailBodyTemplate, processStates.emailBodyTemplate) &&
                Objects.equals(this.emailAttachmentTemplate, processStates.emailAttachmentTemplate) &&
                Objects.equals(this.emailAttachmentFileName, processStates.emailAttachmentFileName) &&
                Objects.equals(this.styles, processStates.styles) &&
                Objects.equals(this.type, processStates.type) &&
                Objects.equals(this.isOnlyAChildState, processStates.isOnlyAChildState) &&
                Objects.equals(this.validateAnswerButtonLabel, processStates.validateAnswerButtonLabel) &&
                Objects.equals(this.modifyAnswerButtonLabel, processStates.modifyAnswerButtonLabel) &&
                Objects.equals(this.automaticPinWhenAcknowledged, processStates.automaticPinWhenAcknowledged);
    }

    @Override
    public int hashCode() {
        return Objects.hash(response, acknowledgmentAllowed, consideredAcknowledgedForUserWhen,
                cancelAcknowledgmentAllowed, showAcknowledgmentFooter, closeCardWhenUserAcknowledges,
                editCardEnabledOnUserInterface, copyCardEnabledOnUserInterface, deleteCardEnabledOnUserInterface, name,
                description, showDetailCardHeader, color, userCard, templateName, emailBodyTemplate, emailAttachmentTemplate, emailAttachmentFileName, styles, type,
                isOnlyAChildState, validateAnswerButtonLabel, modifyAnswerButtonLabel, automaticPinWhenAcknowledged);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class ProcessStates {\n");

        sb.append("    response: ").append(toIndentedString(response)).append("\n");
        sb.append("    acknowledgmentAllowed: ").append(toIndentedString(acknowledgmentAllowed)).append("\n");
        sb.append("    consideredAcknowledgedForUserWhen: ").append(toIndentedString(consideredAcknowledgedForUserWhen))
                .append("\n");
        sb.append("    cancelAcknowledgmentAllowed: ").append(toIndentedString(cancelAcknowledgmentAllowed))
                .append("\n");
        sb.append("    showAcknowledgmentFooter: ").append(toIndentedString(showAcknowledgmentFooter)).append("\n");
        sb.append("    closeCardWhenUserAcknowledges: ").append(toIndentedString(closeCardWhenUserAcknowledges))
                .append("\n");
        sb.append("    editCardEnabledOnUserInterface: ").append(toIndentedString(editCardEnabledOnUserInterface))
                .append("\n");
        sb.append("    copyCardEnabledOnUserInterface: ").append(toIndentedString(copyCardEnabledOnUserInterface))
                .append("\n");
        sb.append("    deleteCardEnabledOnUserInterface: ").append(toIndentedString(deleteCardEnabledOnUserInterface))
                .append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    description: ").append(toIndentedString(description)).append("\n");
        sb.append("    showDetailCardHeader: ").append(toIndentedString(showDetailCardHeader)).append("\n");
        sb.append("    color: ").append(toIndentedString(color)).append("\n");
        sb.append("    userCard: ").append(toIndentedString(userCard)).append("\n");
        sb.append("    templateName: ").append(toIndentedString(templateName)).append("\n");
        sb.append("    emailBodyTemplate: ").append(toIndentedString(emailBodyTemplate)).append("\n");
        sb.append("    emailAttachmentTemplate: ").append(toIndentedString(emailAttachmentTemplate)).append("\n");
        sb.append("    emailAttachmentFileName: ").append(toIndentedString(emailAttachmentFileName)).append("\n");
        sb.append("    styles: ").append(toIndentedString(styles)).append("\n");
        sb.append("    type: ").append(toIndentedString(type)).append("\n");
        sb.append("    isOnlyAChildState: ").append(toIndentedString(isOnlyAChildState)).append("\n");
        sb.append("    validateAnswerButtonLabel: ").append(toIndentedString(validateAnswerButtonLabel)).append("\n");
        sb.append("    modifyAnswerButtonLabel: ").append(toIndentedString(modifyAnswerButtonLabel)).append("\n");
        sb.append("    automaticPinWhenAcknowledged: ").append(toIndentedString(automaticPinWhenAcknowledged))
                .append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(java.lang.Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
