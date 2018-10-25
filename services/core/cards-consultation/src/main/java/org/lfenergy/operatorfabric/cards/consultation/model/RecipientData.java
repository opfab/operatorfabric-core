/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.Recipient;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecipientData implements Recipient {
    private RecipientEnum type;
    private String identity;
    @Singular
    private List<? extends Recipient> recipients;
    private Boolean preserveMain;

}
