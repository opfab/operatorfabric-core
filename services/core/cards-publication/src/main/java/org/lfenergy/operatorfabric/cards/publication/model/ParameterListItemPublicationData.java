/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.ParameterListItem;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParameterListItemPublicationData implements ParameterListItem {
    @NotNull
    private I18n label;
    @NotNull
    private String value;
}
