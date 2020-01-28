
package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * <p>Card Creation Report Model, documented at {@link CardCreationReport}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardCreationReportData implements CardCreationReport {
    @NonNull
    private Integer count;
    @NonNull
    private String message;
}
