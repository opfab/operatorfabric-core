/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.actions.model;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ActionData implements Action {
    private ActionEnum type;
    private String url;
    private Boolean lockAction;
    private Boolean called;
    private Boolean updateStateBeforeAction;
    private Boolean hidden;
    private String buttonStyle;
    private I18n label;
}
