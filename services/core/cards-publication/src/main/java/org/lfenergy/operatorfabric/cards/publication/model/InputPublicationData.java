/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.InputEnum;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * Please use builder to instantiate
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InputPublicationData implements Input {
    @NotNull
    private InputEnum type;
    @NotNull
    private String name;
    @NotNull
    private I18n label;
    private String value;
    private Boolean mandatory;
    private Integer maxLength;
    private Integer rows;
    @Singular private List< ? extends ParameterListItem> values;
    @Singular private List<String> selectedValues;
    @Singular private List<String> unSelectedValues;
}
