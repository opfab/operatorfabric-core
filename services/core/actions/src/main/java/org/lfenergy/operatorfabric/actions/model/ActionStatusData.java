/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.actions.model;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ActionStatusData implements ActionStatus {
    private Boolean lockAction;
    private Boolean called;
    private Boolean updateStateBeforeAction;
    private String buttonStyle;
    private I18n label;

    public static ActionStatus fromAction(Action action) {
        ActionStatusData.ActionStatusDataBuilder result = ActionStatusData.builder()
                .lockAction(action.getLockAction())
                .called(action.getCalled())
                .buttonStyle(action.getButtonStyle())
                ;
        if(action.getLabel()!=null){
            I18nData.I18nDataBuilder labelBuilder = I18nData.builder().key(action.getLabel().getKey());
            if(action.getLabel().getParameters()!=null)
                labelBuilder.parameters(action.getLabel().getParameters());
            result.label(labelBuilder.build());
        }
        return result.build();
    }
}
