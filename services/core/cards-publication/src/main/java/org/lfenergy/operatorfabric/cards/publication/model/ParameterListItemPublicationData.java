
package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParameterListItemPublicationData implements ParameterListItem {
    @NotNull
    private I18n label;
    @NotNull
    private String value;
}
