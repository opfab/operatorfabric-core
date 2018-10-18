/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.model;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InputData implements Input{
    private InputEnum type;
    private String name;
    private I18n label;
    private String value;
    private Boolean mandatory;
    private Integer maxLength;
    private Integer rows;
    @Singular
    private List< ? extends ParameterListItem> values = new ArrayList<>();
    @Singular
    private List<String> selectedValues = new ArrayList<>();
    @Singular
    private List<String> unSelectedValues = new ArrayList<>();
}
