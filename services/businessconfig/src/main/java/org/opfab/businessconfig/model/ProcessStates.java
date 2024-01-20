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

import java.util.List;

import org.springframework.validation.annotation.Validated;


@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Validated
public record ProcessStates(
    AcknowledgmentAllowedEnum acknowledgmentAllowed,
    ConsideredAcknowledgedForUserWhenEnum consideredAcknowledgedForUserWhen,
    ShowAcknowledgmentFooterEnum showAcknowledgmentFooter,
    Boolean cancelAcknowledgmentAllowed,
    Boolean closeCardWhenUserAcknowledges,
    Boolean editCardEnabledOnUserInterface,
    Boolean copyCardEnabledOnUserInterface,
    Boolean deleteCardEnabledOnUserInterface,
    String color,
    String name,
    String description,
    Boolean showDetailCardHeader,
    UserCard userCard,
    Response response,
    String templateName,
    String emailBodyTemplate,
    List<String> styles,
    TypeOfStateEnum type,
    Boolean isOnlyAChildState,
    String validateAnswerButtonLabel,
    String modifyAnswerButtonLabel,
    Boolean automaticPinWhenAcknowledged
) {
    public ProcessStates {
        if (cancelAcknowledgmentAllowed == null) {
            cancelAcknowledgmentAllowed = true;
        }
        if (closeCardWhenUserAcknowledges == null) {
            closeCardWhenUserAcknowledges = true;
        }
        if (editCardEnabledOnUserInterface == null) {
            editCardEnabledOnUserInterface = true;
        }
        if (copyCardEnabledOnUserInterface == null) {
            copyCardEnabledOnUserInterface = true;
        }
        if (deleteCardEnabledOnUserInterface == null) {
            deleteCardEnabledOnUserInterface = true;
        }
    }
}
