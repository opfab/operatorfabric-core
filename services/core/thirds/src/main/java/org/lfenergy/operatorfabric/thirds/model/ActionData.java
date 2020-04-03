/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import javax.validation.constraints.NotNull;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Action Model, documented at {@link Action}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionData implements Action {
    @NotNull
    private ActionEnum type;
    private String url;
    @NotNull
    private I18n label;
    private String buttonStyle;
    private Boolean lockAction;
    private Boolean updateStateBeforeAction;
    private Boolean called;
    private Boolean hidden;
}
