package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;

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
public class DetailPublicationData implements Detail {
    private TitlePositionEnum titlePosition;
    private I18n title;
    private String titleStyle;
    @NotNull
    private String templateName;
    @Singular
    private List<String> styles;
}
