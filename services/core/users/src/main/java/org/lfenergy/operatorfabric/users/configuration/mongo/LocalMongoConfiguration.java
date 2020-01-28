
package org.lfenergy.operatorfabric.users.configuration.mongo;

import org.lfenergy.operatorfabric.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Specific mongo converter declaration configuration
 *
 * @author David Binder
 */
@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    @Override
    public List<Converter> converterList() {
        return Collections.emptyList();
    }
}
