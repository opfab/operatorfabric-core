package org.lfenergy.operatorfabric.cards.consultation.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.consultation.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nConsultationData.class);
    addAbstractTypeMapping(Card.class,CardConsultationData.class);
    addAbstractTypeMapping(Action.class,ActionConsultationData.class);
    addAbstractTypeMapping(Detail.class,DetailConsultationData.class);
    addAbstractTypeMapping(Input.class,InputConsultationData.class);
    addAbstractTypeMapping(Recipient.class,RecipientConsultationData.class);
    addAbstractTypeMapping(ParameterListItem.class,ParameterListItemConsultationData.class);
    addAbstractTypeMapping(LightCard.class,LightCardConsultationData.class);
    }
}
