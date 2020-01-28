
package org.lfenergy.operatorfabric.cards.consultation.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.data.domain.PageImpl;


/**
 * Jackson (JSON) Module configuration to handle (de)serialization of objects involved in returning paged results
 *
 * @author Alexandra Guironnet
 */
public class PagedResultsModule extends SimpleModule {

    public PagedResultsModule() {

        addSerializer(PageImpl.class, new PageImplSerializer());
    }
}
