package org.opfab.externaldevices.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "signalMapping")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SignalMappingData implements SignalMapping {

    private String id;
    @Singular
    private Map<String, Integer> supportedSignals;

    public SignalMappingData(SignalMapping signalMapping) {

        this.id = signalMapping.getId();
        this.supportedSignals = signalMapping.getSupportedSignals();

    }
}
