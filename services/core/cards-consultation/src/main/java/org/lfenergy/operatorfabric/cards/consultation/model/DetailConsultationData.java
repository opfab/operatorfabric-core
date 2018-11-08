package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.TitlePositionEnum;

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
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DetailConsultationData implements Detail {
    private TitlePositionEnum titlePosition;
    private I18n title;
    private String titleStyle;

    private String templateName;
    @Singular
    private List<String> styles;
}
