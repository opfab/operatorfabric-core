
package org.lfenergy.operatorfabric.test;

import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;

/**
 * <p></p>
 * Created on 25/06/18
 *
 * @author David Binder
 */
public class TestUtilsShould {

  @Test
  public void testException(){
    assertException(IOException.class).isThrownBy(()->{
      throw new IOException();
    });
    assertException(AssertionError.class).isThrownBy(()-> {
      assertException(IOException.class).isThrownBy(() -> {
        int i = 0;
        i++;
      });
    });
  }

}