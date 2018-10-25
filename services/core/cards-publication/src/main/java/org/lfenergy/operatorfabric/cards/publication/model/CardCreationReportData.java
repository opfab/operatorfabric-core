/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.Data;
import lombok.NonNull;
import org.lfenergy.operatorfabric.cards.model.CardCreationReport;

/**
 * <p></p>
 * Created on 02/08/18
 *
 * @author davibind
 */
@Data
public class CardCreationReportData implements CardCreationReport {
    @NonNull
    private Integer count;
    @NonNull
    private String message;
}
