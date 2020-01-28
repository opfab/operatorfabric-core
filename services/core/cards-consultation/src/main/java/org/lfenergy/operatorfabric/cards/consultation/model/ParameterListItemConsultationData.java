
package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Parameter List Item Model, documented at {@link ParameterListItem}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParameterListItemConsultationData implements ParameterListItem {
    private I18n label;
    private String value;
}
