package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.*;

import java.util.Map;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>I18n Model, documented at {@link I18n}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class I18nConsultationData implements I18n {
    private String key;
    @Singular
    private Map<String,String> parameters;
}
