/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
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

public class UserCard {
    private String template = null;

    private Boolean severityVisible = null;

    private Boolean keepChildCardsVisible = null;

    private Boolean startDateVisible = null;

    private Boolean endDateVisible = null;

    private Boolean expirationDateVisible = null;

    private Boolean lttdVisible = null;

    private Boolean recipientVisible = null;

    private Boolean recipientForInformationVisible = null;

    private Boolean publisherVisible = null;

    private List<EntitiesTree> publisherList = null;

    public UserCard template(String template) {
        this.template = template;
        return this;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public UserCard severityVisible(Boolean severityVisible) {
        this.severityVisible = severityVisible;
        return this;
    }

    public Boolean getSeverityVisible() {
        return severityVisible;
    }

    public void setSeverityVisible(Boolean severityVisible) {
        this.severityVisible = severityVisible;
    }

    public UserCard keepChildCardsVisible(Boolean keepChildCardsVisible) {
        this.keepChildCardsVisible = keepChildCardsVisible;
        return this;
    }

    public Boolean getKeepChildCardsVisible() {
        return keepChildCardsVisible;
    }

    public void setKeepChildCardsVisible(Boolean keepChildCardsVisible) {
        this.keepChildCardsVisible = keepChildCardsVisible;
    }

    public UserCard startDateVisible(Boolean startDateVisible) {
        this.startDateVisible = startDateVisible;
        return this;
    }

    public Boolean getStartDateVisible() {
        return startDateVisible;
    }

    public void setStartDateVisible(Boolean startDateVisible) {
        this.startDateVisible = startDateVisible;
    }

    public UserCard endDateVisible(Boolean endDateVisible) {
        this.endDateVisible = endDateVisible;
        return this;
    }

    public Boolean getEndDateVisible() {
        return endDateVisible;
    }

    public void setEndDateVisible(Boolean endDateVisible) {
        this.endDateVisible = endDateVisible;
    }

    public UserCard expirationDateVisible(Boolean expirationDateVisible) {
        this.expirationDateVisible = expirationDateVisible;
        return this;
    }

    public Boolean getExpirationDateVisible() {
        return expirationDateVisible;
    }

    public void setExpirationDateVisible(Boolean expirationDateVisible) {
        this.expirationDateVisible = expirationDateVisible;
    }

    public UserCard lttdVisible(Boolean lttdVisible) {
        this.lttdVisible = lttdVisible;
        return this;
    }

    public Boolean getLttdVisible() {
        return lttdVisible;
    }

    public void setLttdVisible(Boolean lttdVisible) {
        this.lttdVisible = lttdVisible;
    }

    public UserCard recipientVisible(Boolean recipientVisible) {
        this.recipientVisible = recipientVisible;
        return this;
    }

    public Boolean getRecipientVisible() {
        return recipientVisible;
    }

    public void setRecipientVisible(Boolean recipientVisible) {
        this.recipientVisible = recipientVisible;
    }

    public UserCard recipientForInformationVisible(Boolean recipientForInformationVisible) {
        this.recipientForInformationVisible = recipientForInformationVisible;
        return this;
    }

    public Boolean getRecipientForInformationVisible() {
        return recipientForInformationVisible;
    }

    public void setRecipientForInformationVisible(Boolean recipientForInformationVisible) {
        this.recipientForInformationVisible = recipientForInformationVisible;
    }

    public UserCard publisherVisible(Boolean publisherVisible) {
        this.publisherVisible = publisherVisible;
        return this;
    }

    public Boolean getPublisherVisible() {
        return publisherVisible;
    }

    public void setPublisherVisible(Boolean publisherVisible) {
        this.publisherVisible = publisherVisible;
    }

    public UserCard publisherList(List<EntitiesTree> publisherList) {
        this.publisherList = publisherList;
        return this;
    }

    public UserCard addPublisherListItem(EntitiesTree publisherListItem) {
        if (this.publisherList == null) {
            this.publisherList = new ArrayList<>();
        }
        this.publisherList.add(publisherListItem);
        return this;
    }

    public List<EntitiesTree> getPublisherList() {
        return publisherList;
    }

    public void setPublisherList(List<EntitiesTree> publisherList) {
        this.publisherList = publisherList;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserCard userCard = (UserCard) o;
        return Objects.equals(this.template, userCard.template) &&
                Objects.equals(this.severityVisible, userCard.severityVisible) &&
                Objects.equals(this.keepChildCardsVisible, userCard.keepChildCardsVisible) &&
                Objects.equals(this.startDateVisible, userCard.startDateVisible) &&
                Objects.equals(this.endDateVisible, userCard.endDateVisible) &&
                Objects.equals(this.expirationDateVisible, userCard.expirationDateVisible) &&
                Objects.equals(this.lttdVisible, userCard.lttdVisible) &&
                Objects.equals(this.recipientVisible, userCard.recipientVisible) &&
                Objects.equals(this.recipientForInformationVisible, userCard.recipientForInformationVisible) &&
                Objects.equals(this.publisherVisible, userCard.publisherVisible) &&
                Objects.equals(this.publisherList, userCard.publisherList);
    }

    @Override
    public int hashCode() {
        return Objects.hash(template, severityVisible, keepChildCardsVisible, startDateVisible, endDateVisible,
                expirationDateVisible, lttdVisible, recipientVisible, recipientForInformationVisible, publisherVisible,
                publisherList);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class UserCard {\n");

        sb.append("    template: ").append(toIndentedString(template)).append("\n");
        sb.append("    severityVisible: ").append(toIndentedString(severityVisible)).append("\n");
        sb.append("    keepChildCardsVisible: ").append(toIndentedString(keepChildCardsVisible)).append("\n");
        sb.append("    startDateVisible: ").append(toIndentedString(startDateVisible)).append("\n");
        sb.append("    endDateVisible: ").append(toIndentedString(endDateVisible)).append("\n");
        sb.append("    expirationDateVisible: ").append(toIndentedString(expirationDateVisible)).append("\n");
        sb.append("    lttdVisible: ").append(toIndentedString(lttdVisible)).append("\n");
        sb.append("    recipientVisible: ").append(toIndentedString(recipientVisible)).append("\n");
        sb.append("    recipientForInformationVisible: ").append(toIndentedString(recipientForInformationVisible))
                .append("\n");
        sb.append("    publisherVisible: ").append(toIndentedString(publisherVisible)).append("\n");
        sb.append("    publisherList: ").append(toIndentedString(publisherList)).append("\n");
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
