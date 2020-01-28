
package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import org.lfenergy.operatorfabric.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
import org.lfenergy.operatorfabric.utilities.CollectionUtils;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Configures mongo {@link org.bson.Document} to Business objects converters
 *
 * @author David Binder
 */
@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    public List<Converter> converterList() {
        return CollectionUtils.createArrayList(
                new I18nReadConverter(),
                new DetailReadConverter(),
                new RecipientReadConverter(),
                new LightCardReadConverter(),
                new CardOperationReadConverter(),
                new TimeSpanReadConverter()
        );
    }
}
