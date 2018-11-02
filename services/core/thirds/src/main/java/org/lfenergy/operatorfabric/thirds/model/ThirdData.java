/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Third Model, documented at {@link Third}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThirdData implements Third {

  private String name;
  private String version;
  private String defaultLocale;
  @Singular
  private List<String> templates;
  @Singular
  private List<String> csses;
  @Singular("mediasData")
  private Map<String,ThirdMediasData> mediasData;
  @Singular
  private List<String> locales;

  public Map<String, ? extends ThirdMedias> getMedias(){
    return mediasData;
  }

  public void setMedias(Map<String, ? extends ThirdMedias> mediasData){
    this.mediasData = new HashMap<>((Map<String,ThirdMediasData>) mediasData);
  }

}