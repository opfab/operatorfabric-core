package org.lfenergy.operatorfabric.users.config.mongo;

import org.lfenergy.operatorfabric.springtools.config.mongo.AbstractLocalMongoConfiguration;
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
public class LocalMongoConfig extends AbstractLocalMongoConfiguration {
    /**
     * The mongo converter list (empty)
     * @return
     */
    @Override
    public List<Converter> converterList() {
        return Collections.emptyList();
    }
}
