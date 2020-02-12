/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Detail Model, documented at {@link Detail}</p>
 *
 * {@inheritDoc}
 *
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailData implements Detail {
    private I18n title;
    private String titleStyle;
    @NotNull
    private String templateName;
    @Singular
    private List<String> styles;
}
