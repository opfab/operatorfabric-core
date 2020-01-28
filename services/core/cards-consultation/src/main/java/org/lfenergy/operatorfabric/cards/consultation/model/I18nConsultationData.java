
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

    public static I18n copy(I18n other) {
        if(other == null)
            return null;
        I18nConsultationDataBuilder builder = builder().key(other.getKey());
        if(other.getParameters()!= null && !other.getParameters().isEmpty())
            other.getParameters().forEach(builder::parameter);
        return builder.build();
    }
}
