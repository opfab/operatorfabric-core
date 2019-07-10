package org.lfenergy.operatorfabric.actions.model;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class I18nData implements I18n {
    @NotNull
    private String key;
    @Singular
    private Map<String,String> parameters;
}