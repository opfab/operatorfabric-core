/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.Action;
import org.lfenergy.operatorfabric.cards.model.ActionEnum;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.Input;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActionData implements Action {
    private ActionEnum type;
    private I18n label;
    @Singular
    private List<? extends Input> inputs = new ArrayList<>();
    public String buttonStyle;
    public String contentStyle;
    private Boolean lockAction = false;
    private Boolean lockCard = false;
    private Boolean updateState = false;
    private Boolean updateStateBeforeAction = false;
    private Boolean called = false;
    private Boolean needsConfirm = false;
    private Boolean hidden = false;
}
