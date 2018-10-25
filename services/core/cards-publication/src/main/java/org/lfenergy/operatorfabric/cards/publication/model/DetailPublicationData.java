/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.Detail;
import org.lfenergy.operatorfabric.cards.model.I18n;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailPublicationData implements Detail {
    private TitlePositionEnum titlePosition;
    private I18n title;
    private String titleStyle;
    @NotNull
    private String templateName;
    @Singular
    private List<String> styles;
}
