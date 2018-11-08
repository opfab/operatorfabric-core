package org.lfenergy.operatorfabric.cards.publication.config.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.cards.publication.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class CardsModule extends SimpleModule {

    public CardsModule() {

    addAbstractTypeMapping(I18n.class,I18nPublicationData.class);
    addAbstractTypeMapping(Card.class,CardPublicationData.class);
    addAbstractTypeMapping(LightCard.class,LightCardPublicationData.class);
    addAbstractTypeMapping(Action.class,ActionPublicationData.class);
    addAbstractTypeMapping(Detail.class,DetailPublicationData.class);
    addAbstractTypeMapping(Input.class,InputPublicationData.class);
    addAbstractTypeMapping(Recipient.class,RecipientPublicationData.class);
    addAbstractTypeMapping(ParameterListItem.class,ParameterListItemPublicationData.class);
    addAbstractTypeMapping(CardOperation.class,CardOperationData.class);
    addAbstractTypeMapping(CardCreationReport.class,CardCreationReportData.class);
    }
}
