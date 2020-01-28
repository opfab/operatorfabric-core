
package org.lfenergy.operatorfabric.thirds.model;

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
public class I18nData implements I18n {
    @NotNull
    private String key;
    @Singular private Map<String,String> parameters;
}
