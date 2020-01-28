
package org.lfenergy.operatorfabric.springtools.configuration.mongo;

import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * <p>Class to implement locally for specific mongo configuration</p>
 * <p>Includes</p>
 * <ul>
 *     <li>Define converter list through {@link #converterList}</li>
 * </ul>
 */
public abstract class AbstractLocalMongoConfiguration {

    /**
     * generate a specific local mongo converter list
     * @return The mongo converter list (empty)
     */
    public abstract List<Converter> converterList();
}
