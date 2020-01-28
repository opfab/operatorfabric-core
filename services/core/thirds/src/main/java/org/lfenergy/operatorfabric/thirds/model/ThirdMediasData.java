
package org.lfenergy.operatorfabric.thirds.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Third Media model, documented at {@link Third}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThirdMediasData implements ThirdMedias {

  private String name;
  private List<String> files;
}
