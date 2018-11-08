package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;

import javax.validation.constraints.NotNull;
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
@AllArgsConstructor
@NoArgsConstructor
public class I18nPublicationData implements I18n {
    @NotNull
    private String key;
    @Singular private Map<String,String> parameters;

    public I18n copy(){
        return I18nPublicationData.builder()
           .key(this.getKey())
           .parameters(this.getParameters())
           .build();
    }
}
