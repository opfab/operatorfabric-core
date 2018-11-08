package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.InputEnum;

import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Input Model, documented at {@link Input}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InputConsultationData implements Input {
    private InputEnum type;
    private String name;
    private I18n label;
    private String value;
    private Boolean mandatory;
    private Integer maxLength;
    private Integer rows;
    @Singular
    private List< ? extends ParameterListItem> values;
    @Singular
    private List<String> selectedValues;
    @Singular
    private List<String> unSelectedValues;
}
