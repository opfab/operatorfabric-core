
package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Detail Model, documented at {@link Detail}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailData implements Detail {
    private I18n title;
    private String titleStyle;
    @NotNull
    private String templateName;
    @Singular
    private List<String> styles;
}
