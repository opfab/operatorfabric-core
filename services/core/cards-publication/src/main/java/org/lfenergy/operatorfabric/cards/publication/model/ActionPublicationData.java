/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.Action;
import org.lfenergy.operatorfabric.cards.model.ActionEnum;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.Input;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * Plese use builder to instantiate
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionPublicationData implements Action {
    @NotNull
    private ActionEnum type;
    @NotNull
    private I18n label;
    @Singular  private List<? extends Input> inputs;
    private String buttonStyle;
    private String contentStyle;
    private Boolean lockAction;
    private Boolean lockCard;
    private Boolean updateState;
    private Boolean updateStateBeforeAction;
    private Boolean called;
    private Boolean needsConfirm;
    private Boolean hidden;
}
