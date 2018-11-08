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