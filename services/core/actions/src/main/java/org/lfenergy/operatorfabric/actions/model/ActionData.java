/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ActionData implements Action {
    private ActionEnum type;
    private String url;
    private Boolean lockAction;
    private Boolean lockCard;
    private Boolean needsConfirm;
    private Boolean called;
    private Boolean updateState;
    private Boolean updateStateBeforeAction;
    private Boolean hidden;
    private String contentStyle;
    private String buttonStyle;
    private I18n label;
    private List< ? extends Input> inputs;
}
