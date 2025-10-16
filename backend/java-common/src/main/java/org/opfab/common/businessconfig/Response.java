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
public class Response {
    private Boolean lock = null;

    private String state = null;

    private List<String> externalRecipients = null;

    private Boolean emittingEntityAllowedToRespond = null;

    private Boolean showConfirmationPopup = null;

    public Response lock(Boolean lock) {
        this.lock = lock;
        return this;
    }

    public Boolean getLock() {
        return lock;
    }

    public void setLock(Boolean lock) {
        this.lock = lock;
    }

    public Response state(String state) {
        this.state = state;
        return this;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Response externalRecipients(List<String> externalRecipients) {
        this.externalRecipients = externalRecipients;
        return this;
    }

    public Response addExternalRecipientsItem(String externalRecipientsItem) {
        if (this.externalRecipients == null) {
            this.externalRecipients = new ArrayList<>();
        }
        this.externalRecipients.add(externalRecipientsItem);
        return this;
    }

    public List<String> getExternalRecipients() {
        return externalRecipients;
    }

    public void setExternalRecipients(List<String> externalRecipients) {
        this.externalRecipients = externalRecipients;
    }

    public Response emittingEntityAllowedToRespond(Boolean emittingEntityAllowedToRespond) {
        this.emittingEntityAllowedToRespond = emittingEntityAllowedToRespond;
        return this;
    }

    public Boolean getEmittingEntityAllowedToRespond() {
        return emittingEntityAllowedToRespond;
    }

    public void setEmittingEntityAllowedToRespond(Boolean emittingEntityAllowedToRespond) {
        this.emittingEntityAllowedToRespond = emittingEntityAllowedToRespond;
    }

    public Response showConfirmationPopup(Boolean showConfirmationPopup) {
        this.showConfirmationPopup = showConfirmationPopup;
        return this;
    }

    public Boolean getShowConfirmationPopup() {
        return showConfirmationPopup;
    }

    public void setShowConfirmationPopup(Boolean showConfirmationPopup) {
        this.showConfirmationPopup = showConfirmationPopup;
    }

    @Override
    public boolean equals(java.lang.Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Response response = (Response) o;
        return Objects.equals(this.lock, response.lock) &&
                Objects.equals(this.state, response.state) &&
                Objects.equals(this.externalRecipients, response.externalRecipients) &&
                Objects.equals(this.emittingEntityAllowedToRespond, response.emittingEntityAllowedToRespond) &&
                Objects.equals(this.showConfirmationPopup, response.showConfirmationPopup);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lock, state, externalRecipients, emittingEntityAllowedToRespond, showConfirmationPopup);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Response {\n");

        sb.append("    lock: ").append(toIndentedString(lock)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    externalRecipients: ").append(toIndentedString(externalRecipients)).append("\n");
        sb.append("    emittingEntityAllowedToRespond: ").append(toIndentedString(emittingEntityAllowedToRespond))
                .append("\n");
        sb.append("    showConfirmationPopup: ").append(toIndentedString(showConfirmationPopup)).append("\n");
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
