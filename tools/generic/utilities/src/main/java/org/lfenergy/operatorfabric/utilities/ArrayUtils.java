package org.lfenergy.operatorfabric.utilities;

import java.util.Arrays;

public class ArrayUtils {

    public static <T> T[] copyOfRange(T[] source, int from) {
        return Arrays.copyOfRange(source,from,source.length);
    }
}
