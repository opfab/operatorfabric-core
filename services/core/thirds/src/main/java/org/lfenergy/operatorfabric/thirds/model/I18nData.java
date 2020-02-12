/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.Map;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>I18n Model, documented at {@link I18n}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class I18nData implements I18n {
    @NotNull
    private String key;
    @Singular private Map<String,String> parameters;
}
