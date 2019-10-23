package org.lfenergy.operatorfabric.utilities;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ArrayUtilsShould {

    @Test
    public void copyOfRange(){
        String[] stringSource = {"zero","one","two","three"};
        assertThat(ArrayUtils.copyOfRange(stringSource, 2)).contains("two","three");

        Integer[] intSource = {0,1,2,3};
        assertThat(ArrayUtils.copyOfRange(intSource, 1)).contains(1,2,3);

    }
}
