
package org.lfenergy.operatorfabric.utilities;

import java.util.ArrayList;
import java.util.List;

/**
 * A collection of {@link java.util.Collections} utilities
 */
public class CollectionUtils {

    /**
     * Create an {@link ArrayList} from an array of elements
     * @param array the elements to add
     * @param <T> the elements' type
     * @return the created {@link ArrayList}
     */
    public static <T> List<T> createArrayList(T... array){
        List<T> result = new ArrayList<>();
        for (T t: array) {
            result.add(t);
        }

        return result;
    }
}
