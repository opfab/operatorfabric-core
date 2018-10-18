/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * <p></p>
 * Created on 07/08/18
 *
 * @author davibind
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardMessage {
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Singular
    private List<CardOperation> operations;
}
